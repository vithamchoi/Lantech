using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SWD392.LantechEnglish.Application.Common.Models;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Application.DTOs.Admin;
using SWD392.LantechEnglish.Application.DTOs.Vocabulary;
using System;
using System.Threading.Tasks;

namespace SWD392.LantechEnglish.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet("overview")]
        public async Task<IActionResult> GetOverviewStats()
        {
            var stats = await _adminService.GetOverviewStatsAsync();
            return Ok(ApiResponse<AdminStatsDto>.SuccessResponse(stats));
        }

        // 8. Users (4)
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _adminService.GetUsersAsync();
            return Ok(ApiResponse<object>.SuccessResponse(users));
        }

        [HttpGet("users/{id}")] public IActionResult GetUser(Guid id) => Ok();
        
        public class UpdateRoleRequest { public string Role { get; set; } = null!; }
        [HttpPatch("users/{id}/role")] 
        public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] UpdateRoleRequest request)
        {
            var result = await _adminService.UpdateUserRoleAsync(id, request.Role);
            if (!result) return NotFound(ApiResponse<object>.ErrorResponse("User not found or invalid role"));
            return Ok(ApiResponse<object>.SuccessResponse(true));
        }
        
        public class UpdateStatusRequest { public string Status { get; set; } = null!; }
        [HttpPatch("users/{id}/status")] 
        public async Task<IActionResult> UpdateUserStatus(Guid id, [FromBody] UpdateStatusRequest request)
        {
            var result = await _adminService.UpdateUserStatusAsync(id, request.Status);
            if (!result) return NotFound(ApiResponse<object>.ErrorResponse("User not found or invalid status"));
            return Ok(ApiResponse<object>.SuccessResponse(true));
        }

        // 1. Languages (5)
        [HttpGet("languages")] public IActionResult GetLanguages() => Ok();
        [HttpGet("languages/{id}")] public IActionResult GetLanguage(int id) => Ok();
        [HttpPost("languages")] public IActionResult CreateLanguage() => Ok();
        [HttpPut("languages/{id}")] public IActionResult UpdateLanguage(int id) => Ok();
        [HttpDelete("languages/{id}")] public IActionResult DeleteLanguage(int id) => Ok();

        // 2. Questions (5)
        [HttpGet("questions")]
        public async Task<IActionResult> GetQuestions()
        {
            var questions = await _adminService.GetQuestionsAsync();
            return Ok(ApiResponse<object>.SuccessResponse(questions));
        }
        [HttpGet("questions/{id}")] public IActionResult GetQuestion(Guid id) => Ok();
        [HttpPost("questions")]
        public async Task<IActionResult> CreateQuestion([FromBody] CreateExerciseRequest request)
        {
            var result = await _adminService.CreateExerciseAsync(request);
            return Ok(ApiResponse<object>.SuccessResponse(result, "Question created successfully"));
        }
        [HttpPut("questions/{id}")]
        public async Task<IActionResult> UpdateQuestion(Guid id, [FromBody] CreateExerciseRequest request)
        {
            var result = await _adminService.UpdateExerciseAsync(id, request);
            return Ok(ApiResponse<object>.SuccessResponse(result, "Question updated successfully"));
        }
        [HttpDelete("questions/{id}")]
        public async Task<IActionResult> DeleteQuestion(Guid id)
        {
            var result = await _adminService.DeleteExerciseAsync(id);
            if (!result) return NotFound(ApiResponse<object>.ErrorResponse("Question not found"));
            return Ok(ApiResponse<object>.SuccessResponse(true, "Question deleted successfully"));
        }

        // 3. Lessons (5)
        [HttpGet("lessons")] 
        public async Task<IActionResult> GetLessons()
        {
            var lessons = await _adminService.GetLessonsAsync();
            return Ok(ApiResponse<object>.SuccessResponse(lessons));
        }
        [HttpGet("lessons/{id}")] public IActionResult GetLesson(Guid id) => Ok();
        [HttpPost("lessons")]
        public async Task<IActionResult> CreateLesson([FromBody] CreateLessonRequest request)
        {
            var result = await _adminService.CreateLessonAsync(request);
            return Ok(ApiResponse<object>.SuccessResponse(result, "Lesson created successfully"));
        }
        [HttpPut("lessons/{id}")]
        public async Task<IActionResult> UpdateLesson(Guid id, [FromBody] CreateLessonRequest request)
        {
            var result = await _adminService.UpdateLessonAsync(id, request);
            return Ok(ApiResponse<object>.SuccessResponse(result, "Lesson updated successfully"));
        }
        [HttpDelete("lessons/{id}")]
        public async Task<IActionResult> DeleteLesson(Guid id)
        {
            var result = await _adminService.DeleteLessonAsync(id);
            if (!result) return NotFound(ApiResponse<object>.ErrorResponse("Lesson not found"));
            return Ok(ApiResponse<object>.SuccessResponse(true, "Lesson deleted successfully"));
        }

        // 4. Exercises (5)
        [HttpGet("exercises")] public IActionResult GetExercises() => Ok();
        [HttpGet("exercises/{id}")] public IActionResult GetExercise(Guid id) => Ok();
        [HttpPost("exercises")] public IActionResult CreateExercise() => Ok();
        [HttpPut("exercises/{id}")] public IActionResult UpdateExercise(Guid id) => Ok();
        [HttpDelete("exercises/{id}")] public IActionResult DeleteExercise(Guid id) => Ok();

        // 5. Vocabulary (5)
        [HttpGet("vocabulary")]
        public async Task<IActionResult> GetVocabularies()
        {
            var vocabularies = await _adminService.GetVocabulariesAsync();
            return Ok(ApiResponse<object>.SuccessResponse(vocabularies));
        }

        [HttpGet("vocabulary/{id}")]
        public IActionResult GetVocabulary(Guid id) => Ok();

        [HttpPost("vocabulary")]
        public async Task<IActionResult> CreateVocabulary([FromBody] CreateVocabularyRequest request)
        {
            var result = await _adminService.CreateVocabularyAsync(request);
            return Ok(ApiResponse<VocabularyDto>.SuccessResponse(result, "Vocabulary created successfully"));
        }

        [HttpPut("vocabulary/{id}")]
        public async Task<IActionResult> UpdateVocabulary(Guid id, [FromBody] CreateVocabularyRequest request)
        {
            var result = await _adminService.UpdateVocabularyAsync(id, request);
            return Ok(ApiResponse<VocabularyDto>.SuccessResponse(result, "Vocabulary updated successfully"));
        }

        [HttpDelete("vocabulary/{id}")]
        public async Task<IActionResult> DeleteVocabulary(Guid id)
        {
            var result = await _adminService.DeleteVocabularyAsync(id);
            if (!result) return NotFound(ApiResponse.ErrorResponse("Vocabulary not found"));
            return Ok(ApiResponse<bool>.SuccessResponse(true, "Vocabulary deleted successfully"));
        }

        // 6. Translations (4)
        [HttpGet("translations")] public IActionResult GetTranslations() => Ok();
        [HttpPost("translations")] public IActionResult CreateTranslation() => Ok();
        [HttpPut("translations/{id}")] public IActionResult UpdateTranslation(Guid id) => Ok();
        [HttpDelete("translations/{id}")] public IActionResult DeleteTranslation(Guid id) => Ok();

        // 7. Badges (5)
        [HttpGet("badges")]
        public async Task<IActionResult> GetBadges()
        {
            var badges = await _adminService.GetBadgesAsync();
            return Ok(ApiResponse<object>.SuccessResponse(badges));
        }
        [HttpGet("badges/{id}")] public IActionResult GetBadge(Guid id) => Ok();
        [HttpPost("badges")] public IActionResult CreateBadge() => Ok();
        [HttpPut("badges/{id}")] public IActionResult UpdateBadge(Guid id) => Ok();
        [HttpDelete("badges/{id}")] public IActionResult DeleteBadge(Guid id) => Ok();
    }
}
