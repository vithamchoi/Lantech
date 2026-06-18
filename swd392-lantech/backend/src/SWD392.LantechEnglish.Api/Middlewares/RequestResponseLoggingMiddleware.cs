using System.Diagnostics;

namespace SWD392.LantechEnglish.Api.Middlewares;

public class RequestResponseLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestResponseLoggingMiddleware> _logger;

    public RequestResponseLoggingMiddleware(RequestDelegate next, ILogger<RequestResponseLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var request = context.Request;
        
        _logger.LogInformation("HTTP {Method} {Path} received from {IP}", 
            request.Method, request.Path, context.Connection.RemoteIpAddress);

        await _next(context);

        stopwatch.Stop();
        var response = context.Response;

        _logger.LogInformation("HTTP {Method} {Path} responded {StatusCode} in {ElapsedMs}ms", 
            request.Method, request.Path, response.StatusCode, stopwatch.ElapsedMilliseconds);
    }
}
