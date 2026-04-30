using System.ComponentModel;
using System.Text.Json;
using ModelContextProtocol.Server;
using TriviaServer.Data;
using TriviaServer.State;

namespace TriviaServer.Tools;

[McpServerToolType]
public static class TriviaTools
{
    [McpServerTool, Description("List all available trivia categories.")]
    public static string GetCategories() =>
        JsonSerializer.Serialize(new { categories = QuestionBank.Categories });

    [McpServerTool, Description("Get a trivia question. The answer is NOT included — use check_answer to validate the player's response.")]
    public static string GetQuestion(
        [Description("Category name: Science, History, Geography, or Pop Culture. Omit for a random category.")] string? category = null,
        [Description("Difficulty level: easy, medium, or hard. Omit for a random difficulty.")] string? difficulty = null)
    {
        var q = QuestionBank.GetRandom(category, difficulty);
        if (q is null)
            return JsonSerializer.Serialize(new { error = "No question found for the given filters. Try different category or difficulty." });

        return JsonSerializer.Serialize(new
        {
            q.QuestionId,
            question = q.QuestionText,
            q.Category,
            q.Difficulty,
            pointsAvailable = QuestionBank.PointsFor(q.Difficulty),
        });
    }

    [McpServerTool, Description("Check if the player's answer is correct and update their score.")]
    public static string CheckAnswer(
        GameState state,
        [Description("The questionId returned by get_question.")] string questionId,
        [Description("The player's answer text.")] string answer)
    {
        var q = QuestionBank.GetById(questionId);
        if (q is null)
            return JsonSerializer.Serialize(new { error = "Unknown questionId. Call get_question first." });

        bool correct = string.Equals(answer.Trim(), q.Answer, StringComparison.OrdinalIgnoreCase);
        int earned = state.RecordAnswer(questionId, correct, QuestionBank.PointsFor(q.Difficulty));

        return JsonSerializer.Serialize(new
        {
            correct,
            correctAnswer = q.Answer,
            explanation = q.Explanation,
            pointsEarned = earned,
            state.Score,
            state.QuestionsAnswered,
            state.CorrectAnswers,
            state.Streak,
        });
    }

    [McpServerTool, Description("Get a hint for a question. Using a hint deducts 5 points from the answer if correct.")]
    public static string GetHint(
        GameState state,
        [Description("The questionId returned by get_question.")] string questionId)
    {
        var q = QuestionBank.GetById(questionId);
        if (q is null)
            return JsonSerializer.Serialize(new { error = "Unknown questionId." });

        state.MarkHintUsed(questionId);
        return JsonSerializer.Serialize(new { hint = q.Hint, pointsDeducted = 5 });
    }

    [McpServerTool, Description("Get the player's current score and game statistics.")]
    public static string GetScore(GameState state) =>
        JsonSerializer.Serialize(new
        {
            state.Score,
            state.QuestionsAnswered,
            state.CorrectAnswers,
            state.Streak,
        });

    [McpServerTool, Description("Reset the game — clears all scores and statistics. Use when the player wants to start fresh.")]
    public static string ResetGame(GameState state)
    {
        state.Reset();
        return JsonSerializer.Serialize(new { success = true, message = "Game reset! Ready to play again." });
    }
}
