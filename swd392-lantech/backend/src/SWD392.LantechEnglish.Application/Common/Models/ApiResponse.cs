namespace SWD392.LantechEnglish.Application.Common.Models;

public class ApiResponse<T>
{
    public int Code { get; set; }
    public string? Message { get; set; }
    public T? Result { get; set; }
    public List<string>? Errors { get; set; }
    public long Timestamp { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    public string? Path { get; set; }

    public static ApiResponse<T> SuccessResponse(T result, string? message = null)
    {
        return new ApiResponse<T>
        {
            Code = 200,
            Message = message,
            Result = result
        };
    }

    public static ApiResponse<T> ErrorResponse(string message, List<string>? errors = null, int code = 400)
    {
        return new ApiResponse<T>
        {
            Code = code,
            Message = message,
            Errors = errors ?? new List<string>()
        };
    }

    public static ApiResponse<T> ErrorResponse(List<string> errors, int code = 400)
    {
        return new ApiResponse<T>
        {
            Code = code,
            Message = "One or more errors occurred",
            Errors = errors
        };
    }
}

public class ApiResponse : ApiResponse<object>
{
    public static ApiResponse SuccessResult(string? message = null)
    {
        return new ApiResponse
        {
            Code = 200,
            Message = message
        };
    }

    public static new ApiResponse ErrorResponse(string message, List<string>? errors = null, int code = 400)
    {
        return new ApiResponse
        {
            Code = code,
            Message = message,
            Errors = errors ?? new List<string>()
        };
    }
}