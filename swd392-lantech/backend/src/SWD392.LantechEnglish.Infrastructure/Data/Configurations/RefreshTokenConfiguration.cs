using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SWD392.LantechEnglish.Domain.Entities;

namespace SWD392.LantechEnglish.Infrastructure.Data.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("RefreshTokens");
        
        builder.HasKey(rt => rt.Id);
        
        builder.Property(rt => rt.TokenHash)
            .IsRequired()
            .HasMaxLength(500);
        
        builder.Property(rt => rt.ExpiresAt)
            .IsRequired();
        
        builder.Property(rt => rt.CreatedAt)
            .IsRequired();
        
        builder.HasIndex(rt => rt.UserId);
        
        builder.HasIndex(rt => rt.TokenHash)
            .IsUnique();
        
        builder.HasIndex(rt => rt.ExpiresAt);
    }
}