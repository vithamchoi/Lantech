using Microsoft.EntityFrameworkCore;
using SWD392.LantechEnglish.Application.DTOs.Notifications;
using SWD392.LantechEnglish.Application.Interfaces;
using SWD392.LantechEnglish.Domain.Entities;
using SWD392.LantechEnglish.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SWD392.LantechEnglish.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _context;

    public NotificationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync(cancellationToken);

        return notifications.Select(MapToDto);
    }

    public async Task MarkAsReadAsync(Guid userId, Guid notificationId, CancellationToken cancellationToken = default)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId, cancellationToken);

        if (notification == null) throw new KeyNotFoundException("Notification not found");

        notification.IsRead = true;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var unreadNotifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync(cancellationToken);

        foreach (var notification in unreadNotifications)
        {
            notification.IsRead = true;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<NotificationDto> CreateNotificationAsync(Guid userId, string title, string body, string icon, string iconColor, string iconBg, CancellationToken cancellationToken = default)
    {
        var userExists = await _context.Users.AnyAsync(u => u.Id == userId, cancellationToken);
        if (!userExists) throw new KeyNotFoundException("User not found");

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = title,
            Body = body,
            Icon = icon,
            IconColor = iconColor,
            IconBg = iconBg,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(notification);
    }

    private static NotificationDto MapToDto(Notification notification) => new()
    {
        Id = notification.Id,
        UserId = notification.UserId,
        Title = notification.Title,
        Body = notification.Body,
        Icon = notification.Icon,
        IconColor = notification.IconColor,
        IconBg = notification.IconBg,
        IsRead = notification.IsRead,
        CreatedAt = notification.CreatedAt
    };
}
