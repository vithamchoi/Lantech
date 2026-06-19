using SWD392.LantechEnglish.Application.DTOs.Notifications;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace SWD392.LantechEnglish.Application.Interfaces;

public interface INotificationService
{
    Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task MarkAsReadAsync(Guid userId, Guid notificationId, CancellationToken cancellationToken = default);
    Task MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<NotificationDto> CreateNotificationAsync(Guid userId, string title, string body, string icon, string iconColor, string iconBg, CancellationToken cancellationToken = default);
}
