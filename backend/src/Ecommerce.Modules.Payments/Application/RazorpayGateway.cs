using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Ecommerce.Modules.Payments.Contracts;
using Ecommerce.Modules.Payments.Options;
using Ecommerce.Shared.Kernel.Exceptions;
using Microsoft.Extensions.Options;

namespace Ecommerce.Modules.Payments.Application;

/// <summary>
/// Real gateway against Razorpay's Orders API (https://api.razorpay.com/v1/orders), used only
/// when Razorpay:KeyId/KeySecret are configured — RazorpayPaymentService falls back to the
/// dummy simulator otherwise. This has not been exercised against a live Razorpay account;
/// verify the request/response shape against Razorpay's current API docs when connecting real
/// credentials, since provider APIs change over time.
/// </summary>
public sealed class RazorpayGateway(HttpClient httpClient, IOptions<RazorpayOptions> options) : IRazorpayGateway
{
    private RazorpayOptions Settings => options.Value;

    public bool IsConfigured => !string.IsNullOrWhiteSpace(Settings.KeyId) && !string.IsNullOrWhiteSpace(Settings.KeySecret);

    public async Task<RazorpayOrderDto> CreateOrderAsync(Guid orderId, decimal amountInInr, CancellationToken cancellationToken)
    {
        if (!IsConfigured)
        {
            throw new InvalidOperationException("Razorpay is not configured — check IsConfigured before calling CreateOrderAsync.");
        }

        var amountInPaise = (long)Math.Round(amountInInr * 100m, MidpointRounding.AwayFromZero);

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.razorpay.com/v1/orders")
        {
            Content = JsonContent.Create(new
            {
                amount = amountInPaise,
                currency = "INR",
                receipt = orderId.ToString(),
            }),
        };
        request.Headers.Authorization = new AuthenticationHeaderValue(
            "Basic",
            Convert.ToBase64String(Encoding.UTF8.GetBytes($"{Settings.KeyId}:{Settings.KeySecret}")));

        var response = await httpClient.SendAsync(request, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new ConflictException($"Razorpay order creation failed ({response.StatusCode}): {body}");
        }

        using var document = JsonDocument.Parse(body);
        var razorpayOrderId = document.RootElement.GetProperty("id").GetString()
            ?? throw new ConflictException("Razorpay order creation response did not include an order id.");

        return new RazorpayOrderDto(razorpayOrderId, Settings.KeyId!, amountInPaise, "INR");
    }

    public bool VerifyPaymentSignature(string razorpayOrderId, string razorpayPaymentId, string razorpaySignature)
    {
        if (!IsConfigured || string.IsNullOrEmpty(razorpaySignature))
        {
            return false;
        }

        var expected = ComputeHmacHex($"{razorpayOrderId}|{razorpayPaymentId}", Settings.KeySecret!);
        return FixedTimeEquals(expected, razorpaySignature);
    }

    public bool VerifyWebhookSignature(string rawBody, string signatureHeader)
    {
        if (string.IsNullOrEmpty(Settings.WebhookSecret) || string.IsNullOrEmpty(signatureHeader))
        {
            return false;
        }

        var expected = ComputeHmacHex(rawBody, Settings.WebhookSecret);
        return FixedTimeEquals(expected, signatureHeader);
    }

    private static string ComputeHmacHex(string payload, string secret) =>
        Convert.ToHexStringLower(HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes(payload)));

    private static bool FixedTimeEquals(string expectedHex, string providedHex)
    {
        var expectedBytes = Encoding.UTF8.GetBytes(expectedHex);
        var providedBytes = Encoding.UTF8.GetBytes(providedHex);
        return expectedBytes.Length == providedBytes.Length && CryptographicOperations.FixedTimeEquals(expectedBytes, providedBytes);
    }
}
