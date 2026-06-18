using System;
using System.Collections.Generic;

namespace SWD392.LantechEnglish.Domain.Entities;

public class Tag
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public virtual ICollection<Vocabulary> Vocabularies { get; set; } = new List<Vocabulary>();
}
