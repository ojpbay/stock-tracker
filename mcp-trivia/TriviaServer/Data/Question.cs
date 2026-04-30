namespace TriviaServer.Data;

public record Question(
    string QuestionId,
    string QuestionText,
    string Answer,
    string Category,
    string Difficulty,
    string Explanation,
    string Hint);

public static class QuestionBank
{
    public static readonly string[] Categories = ["Science", "History", "Geography", "Pop Culture"];

    public static readonly Dictionary<string, int> Points = new()
    {
        ["easy"] = 10,
        ["medium"] = 20,
        ["hard"] = 30,
    };

    public static readonly IReadOnlyList<Question> All =
    [
        // Science
        new("q01", "What is the chemical symbol for water?", "H2O",
            "Science", "easy",
            "Water is composed of two hydrogen atoms bonded to one oxygen atom.",
            "It contains hydrogen and oxygen."),

        new("q02", "What planet is known as the Red Planet?", "Mars",
            "Science", "easy",
            "Mars appears red due to iron oxide (rust) covering its surface.",
            "It is the fourth planet from the Sun."),

        new("q03", "What is the powerhouse of the cell?", "Mitochondria",
            "Science", "medium",
            "Mitochondria generate most of the cell's ATP through cellular respiration.",
            "It produces ATP energy."),

        new("q04", "What force keeps planets in orbit around the Sun?", "Gravity",
            "Science", "medium",
            "Gravity is the attractive force between masses — it keeps planets on their elliptical orbits.",
            "It is the same force that makes objects fall to Earth."),

        new("q05", "How many bones are in the adult human body?", "206",
            "Science", "hard",
            "Adults have 206 bones; babies are born with ~270 that fuse over time.",
            "It is a number between 200 and 210."),

        // History
        new("q06", "In what year did World War II end?", "1945",
            "History", "easy",
            "WWII ended in Europe on 8 May 1945 (VE Day) and in the Pacific on 2 September 1945 (VJ Day).",
            "It was in the mid-1940s."),

        new("q07", "Who was the first President of the United States?", "George Washington",
            "History", "easy",
            "George Washington served as the 1st President from 1789 to 1797.",
            "His face appears on the US one-dollar bill."),

        new("q08", "In what year did the Berlin Wall fall?", "1989",
            "History", "medium",
            "The Berlin Wall fell on 9 November 1989, marking the end of the Cold War division of Germany.",
            "It happened near the end of the 1980s."),

        new("q09", "Which empire was ruled by Julius Caesar?", "Roman Empire",
            "History", "medium",
            "Julius Caesar was a Roman general and statesman who played a critical role in the rise of the Roman Empire.",
            "It was centred in modern-day Italy."),

        new("q10", "In what year did the Titanic sink?", "1912",
            "History", "hard",
            "The RMS Titanic sank on 15 April 1912 after striking an iceberg on its maiden voyage.",
            "It happened in the early 20th century."),

        // Geography
        new("q11", "What is the capital of Australia?", "Canberra",
            "Geography", "easy",
            "Canberra has been Australia's capital since 1913 — not Sydney or Melbourne, as is often assumed.",
            "It is not Sydney or Melbourne."),

        new("q12", "Which is the longest river in the world?", "Nile",
            "Geography", "easy",
            "The Nile River stretches approximately 6,650 km (4,130 miles) through northeastern Africa.",
            "It flows through Egypt."),

        new("q13", "What country has the most natural lakes?", "Canada",
            "Geography", "medium",
            "Canada contains about 60% of the world's lakes — more than any other country.",
            "It is in North America."),

        new("q14", "What is the smallest country in the world by area?", "Vatican City",
            "Geography", "medium",
            "Vatican City covers just 0.44 km² (110 acres), making it the smallest sovereign state.",
            "It is located within Rome, Italy."),

        new("q15", "What mountain range separates Europe from Asia?", "Ural Mountains",
            "Geography", "hard",
            "The Ural Mountains run north–south through western Russia and serve as the conventional boundary between Europe and Asia.",
            "They run through Russia."),

        // Pop Culture
        new("q16", "Who sang 'Thriller' in 1982?", "Michael Jackson",
            "Pop Culture", "easy",
            "'Thriller' by Michael Jackson was released in 1982 and became the best-selling album of all time.",
            "He is known as the King of Pop."),

        new("q17", "What is the name of Batman's butler?", "Alfred",
            "Pop Culture", "easy",
            "Alfred Pennyworth is Bruce Wayne's loyal butler and confidant in the Batman universe.",
            "His first name is a common British name."),

        new("q18", "Which TV show features the fictional city of Pawnee, Indiana?", "Parks and Recreation",
            "Pop Culture", "medium",
            "Parks and Recreation is an NBC mockumentary sitcom set in the fictional town of Pawnee, Indiana.",
            "It stars Amy Poehler."),

        new("q19", "What is the highest-grossing film franchise of all time?", "Marvel Cinematic Universe",
            "Pop Culture", "medium",
            "The MCU has grossed over $30 billion worldwide, surpassing Star Wars and James Bond.",
            "It features superheroes from comic books."),

        new("q20", "In chess, which piece can only move diagonally?", "Bishop",
            "Pop Culture", "hard",
            "The bishop moves diagonally any number of squares and always stays on the same colour square.",
            "It is a religious title."),
    ];

    public static Question? GetRandom(string? category, string? difficulty)
    {
        var pool = All
            .Where(q => category is null || q.Category.Equals(category, StringComparison.OrdinalIgnoreCase))
            .Where(q => difficulty is null || q.Difficulty.Equals(difficulty, StringComparison.OrdinalIgnoreCase))
            .ToList();

        return pool.Count == 0 ? null : pool[Random.Shared.Next(pool.Count)];
    }

    public static Question? GetById(string id) =>
        All.FirstOrDefault(q => q.QuestionId == id);

    public static int PointsFor(string difficulty) =>
        Points.GetValueOrDefault(difficulty, 10);
}
