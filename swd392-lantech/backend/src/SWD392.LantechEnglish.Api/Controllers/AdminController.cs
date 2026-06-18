using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SWD392.LantechEnglish.Application.Common.Models;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Application.DTOs.Admin;
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
        [HttpPost("questions")] public IActionResult CreateQuestion() => Ok();
        [HttpPut("questions/{id}")] public IActionResult UpdateQuestion(Guid id) => Ok();
        [HttpDelete("questions/{id}")] public IActionResult DeleteQuestion(Guid id) => Ok();

        // 3. Lessons (5)
        [HttpGet("lessons")] 
        public async Task<IActionResult> GetLessons()
        {
            var lessons = await _adminService.GetLessonsAsync();
            return Ok(ApiResponse<object>.SuccessResponse(lessons));
        }
        [HttpGet("lessons/{id}")] public IActionResult GetLesson(Guid id) => Ok();
        [HttpPost("lessons")] public IActionResult CreateLesson() => Ok();
        [HttpPut("lessons/{id}")] public IActionResult UpdateLesson(Guid id) => Ok();
        [HttpDelete("lessons/{id}")] public IActionResult DeleteLesson(Guid id) => Ok();

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
        [HttpGet("vocabulary/{id}")] public IActionResult GetVocabulary(Guid id) => Ok();
        [HttpPost("vocabulary")] public IActionResult CreateVocabulary() => Ok();
        [HttpPut("vocabulary/{id}")] public IActionResult UpdateVocabulary(Guid id) => Ok();
        [HttpDelete("vocabulary/{id}")] public IActionResult DeleteVocabulary(Guid id) => Ok();

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
