using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SWD392.LantechEnglish.Domain.Entities;
using System.Collections.Generic;

namespace SWD392.LantechEnglish.Infrastructure.Data.Configurations;

public class TagConfiguration : IEntityTypeConfiguration<Tag>
{
    public void Configure(EntityTypeBuilder<Tag> builder)
    {
        builder.ToTable("Tags");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(t => t.Name)
            .IsUnique();

        // Configure Many-to-Many Relationship
        builder.HasMany(t => t.Vocabularies)
            .WithMany(v => v.Tags)
            .UsingEntity<Dictionary<string, object>>(
                "VocabularyTags",
                j => j.HasOne<Vocabulary>().WithMany().HasForeignKey("VocabularyId"),
                j => j.HasOne<Tag>().WithMany().HasForeignKey("TagId"),
                j =>
                {
                    j.ToTable("VocabularyTags");
                    j.HasKey("VocabularyId", "TagId");
                });
    }
}
