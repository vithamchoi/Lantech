using Microsoft.CognitiveServices.Speech;
using Microsoft.CognitiveServices.Speech.Audio;
using Microsoft.CognitiveServices.Speech.PronunciationAssessment;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SWD392.LantechEnglish.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace SWD392.LantechEnglish.Infrastructure.Services.AIProviders;

public class AzureSpeechAssessmentProvider : ISpeechAssessmentProvider
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<AzureSpeechAssessmentProvider> _logger;

    public AzureSpeechAssessmentProvider(IConfiguration configuration, ILogger<AzureSpeechAssessmentProvider> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<PronunciationResult> AssessPronunciationAsync(string targetText, byte[] audioData, CancellationToken cancellationToken = default)
    {
        var key = _configuration["AzureSpeech:Key"] ?? _configuration["AzureSpeech__Key"];
        var region = _configuration["AzureSpeech:Region"] ?? _configuration["AzureSpeech__Region"] ?? "koreacentral";

        if (string.IsNullOrWhiteSpace(key))
        {
            _logger.LogError("Azure Speech Key is not configured in environment variables.");
            throw new InvalidOperationException("Azure Speech key is not configured.");
        }

        _logger.LogInformation("Starting Azure Speech Pronunciation Assessment for Target Text: '{TargetText}'", targetText);

        var speechConfig = SpeechConfig.FromSubscription(key, region);
        speechConfig.SpeechRecognitionLanguage = "en-US";

        // Setup Pronunciation Assessment Configuration
        var pronConfig = new PronunciationAssessmentConfig(
            targetText,
            GradingSystem.HundredMark,
            Granularity.Phoneme,
            true // Enable miscue detection
        );

        // Strict settings for precise results
        pronConfig.PhonemeAlphabet = "IPA";
        pronConfig.NBestPhonemeCount = 5;

        using var pushStream = AudioInputStream.CreatePushStream();
        using var audioConfig = AudioConfig.FromStreamInput(pushStream);
        using var recognizer = new SpeechRecognizer(speechConfig, audioConfig);

        pronConfig.ApplyTo(recognizer);

        // Write audio bytes to push stream and close it to signal end of stream
        pushStream.Write(audioData);
        pushStream.Close();

        // Recognize once asynchronously
        var recognitionResult = await recognizer.RecognizeOnceAsync().WaitAsync(TimeSpan.FromSeconds(20), cancellationToken);

        if (recognitionResult.Reason == ResultReason.NoMatch)
        {
            _logger.LogWarning("Azure Speech returned NoMatch - no speech detected.");
            return new PronunciationResult
            {
                Score = 0,
                Accuracy = 0,
                Fluency = 0,
                Completeness = 0,
                Feedback = "No speech detected. Please speak clearly into the microphone.",
                WordLevelFeedbackJson = "[]",
                TranscriptText = string.Empty
            };
        }

        if (recognitionResult.Reason == ResultReason.Canceled)
        {
            var cancellation = CancellationDetails.FromResult(recognitionResult);
            _logger.LogError("Azure Speech Assessment canceled. Reason: {Reason}, ErrorDetails: {ErrorDetails}", cancellation.Reason, cancellation.ErrorDetails);
            throw new InvalidOperationException($"Azure Speech pronunciation assessment canceled: {cancellation.ErrorDetails}");
        }

        if (recognitionResult.Reason != ResultReason.RecognizedSpeech)
        {
            _logger.LogError("Azure Speech Recognition failed. Reason: {Reason}", recognitionResult.Reason);
            throw new InvalidOperationException($"Azure Speech recognition failed with reason: {recognitionResult.Reason}");
        }

        // Retrieve the assessment results
        var pronResult = PronunciationAssessmentResult.FromResult(recognitionResult);

        // Extract word-level (and phoneme-level) feedback
        var wordFeedbacks = new List<object>();
        foreach (var word in pronResult.Words)
        {
            var phonemes = word.Phonemes != null
                ? word.Phonemes.Select(p => (object)new
                  {
                      phoneme = p.Phoneme,
                      accuracyScore = p.AccuracyScore
                  }).ToList()
                : new List<object>();

            wordFeedbacks.Add(new
            {
                word = word.Word,
                accuracyScore = word.AccuracyScore,
                errorType = word.ErrorType,
                phonemes = phonemes
            });
        }

        var overallScore = pronResult.PronunciationScore;
        var feedbackText = overallScore >= 85
            ? "Excellent pronunciation! Your pacing and accuracy are very natural."
            : overallScore >= 70
                ? "Good job! Try practicing the flagged words to sound even better."
                : "A good attempt. Try listening to the correct pronunciation and practice repeating it slowly.";

        _logger.LogInformation("Pronunciation assessment complete. Overall score: {Score}", overallScore);

        return new PronunciationResult
        {
            Score = Math.Round(overallScore, 1),
            Accuracy = Math.Round(pronResult.AccuracyScore, 1),
            Fluency = Math.Round(pronResult.FluencyScore, 1),
            Completeness = Math.Round(pronResult.CompletenessScore, 1),
            Feedback = feedbackText,
            WordLevelFeedbackJson = JsonSerializer.Serialize(wordFeedbacks),
            TranscriptText = recognitionResult.Text
        };
    }
}
