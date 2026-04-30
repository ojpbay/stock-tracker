namespace TriviaServer.State;

public class GameState
{
    private readonly object _lock = new();
    private readonly HashSet<string> _hintsUsed = [];

    public int Score { get; private set; }
    public int QuestionsAnswered { get; private set; }
    public int CorrectAnswers { get; private set; }
    public int Streak { get; private set; }

    public int RecordAnswer(string questionId, bool correct, int basePoints)
    {
        lock (_lock)
        {
            QuestionsAnswered++;
            int earned = 0;
            if (correct)
            {
                int deduction = _hintsUsed.Contains(questionId) ? 5 : 0;
                earned = Math.Max(0, basePoints - deduction);
                Score += earned;
                CorrectAnswers++;
                Streak++;
            }
            else
            {
                Streak = 0;
            }
            return earned;
        }
    }

    public void MarkHintUsed(string questionId)
    {
        lock (_lock) { _hintsUsed.Add(questionId); }
    }

    public void Reset()
    {
        lock (_lock)
        {
            Score = 0;
            QuestionsAnswered = 0;
            CorrectAnswers = 0;
            Streak = 0;
            _hintsUsed.Clear();
        }
    }
}
