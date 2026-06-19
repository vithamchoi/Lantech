using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SWD392.LantechEnglish.Application.Common.Models;
using SWD392.LantechEnglish.Application.DTOs.Notifications;
using SWD392.LantechEnglish.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;

namespace SWD392.LantechEnglish.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    private Guid UserId => Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : Guid.Empty;

    /// <summary>
    /// Retrieve all notifications for the current authenticated user
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<NotificationDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetNotifications(CancellationToken cancellationToken)
    {
        var id = UserId;
        if (id == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        var notifications = await _notificationService.GetUserNotificationsAsync(id, cancellationToken);
        return Ok(ApiResponse<IEnumerable<NotificationDto>>.SuccessResponse(notifications, "Notifications fetched successfully"));
    }

    /// <summary>
    /// Mark a specific notification as read
    /// </summary>
    [HttpPut("{id}/read")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken cancellationToken)
    {
        var userId = UserId;
        if (userId == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        try
        {
            await _notificationService.MarkAsReadAsync(userId, id, cancellationToken);
            return Ok(ApiResponse.SuccessResult("Notification marked as read"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }

    /// <summary>
    /// Mark all notifications as read for the current user
    /// </summary>
    [HttpPut("read-all")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken cancellationToken)
    {
        var userId = UserId;
        if (userId == Guid.Empty) return Unauthorized(ApiResponse.ErrorResponse("Invalid token"));

        try
        {
            await _notificationService.MarkAllAsReadAsync(userId, cancellationToken);
            return Ok(ApiResponse.SuccessResult("All notifications marked as read"));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.ErrorResponse(ex.Message));
        }
    }
}
