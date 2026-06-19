using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SWD392.LantechEnglish.Domain.Entities;

namespace SWD392.LantechEnglish.Infrastructure.Data.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");

        builder.HasKey(n => n.Id);

        builder.Property(n => n.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(n => n.Body)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(n => n.Icon)
            .HasMaxLength(50);

        builder.Property(n => n.IconColor)
            .HasMaxLength(50);

        builder.Property(n => n.IconBg)
            .HasMaxLength(50);

        builder.Property(n => n.IsRead)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(n => n.CreatedAt)
            .IsRequired();

        // Relationship
        builder.HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
