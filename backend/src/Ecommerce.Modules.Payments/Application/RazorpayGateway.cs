using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Ecommerce.Modules.Payments.Contracts;
using Ecommerce.Modules.Payments.Options;
using Ecommerce.Shared.Infrastructure.Settings;
using Ecommerce.Shared.Kernel.Exceptions;
using Microsoft.Extensions.Options;

namespace Ecommerce.Modules.Payments.Application;

/// <summary>
/// Real gateway against Razorpay's Orders API (https://api.razorpay.com/v1/orders). Credentials
/// are resolved per call: a database override set via the admin Integration Settings page (see
/// IIntegrationSettingsStore) takes precedence, falling back to Razorpay:* in appsettings/
/// user-secrets. RazorpayPaymentService falls back to the dummy simulator when neither source
/// has a KeyId/KeySecret. This has not been exercised against a live Razorpay account; verify
/// the request/response shape against Razorpay's current API docs when connecting real
/// credentials, since provider APIs change over time.
/// </summary>
public sealed class RazorpayGateway(HttpClient httpClient, IOptions<RazorpayOptions> options, IIntegrationSettingsStore settingsStore) : IRazorpayGateway
{
    private RazorpayOptions Configured => options.Value;

    private async Task<(string? KeyId, string? KeySecret)> GetEffectiveKeysAsync(CancellationToken cancellationToken)
    {
        var keyId = await settingsStore.GetOverrideAsync("Razorpay:KeyId", cancellationToken) ?? Configured.KeyId;
        var keySecret = await settingsStore.GetOverrideAsync("Razorpay:KeySecret", cancellationToken) ?? Configured.KeySecret;
        return (keyId, keySecret);
    }

    private async Task<string?> GetEffectiveWebhookSecretAsync(CancellationToken cancellationToken) =>
        await settingsStore.GetOverrideAsync("Razorpay:WebhookSecret", cancellationToken) ?? Configured.WebhookSecret;

    public async Task<bool> IsConfiguredAsync(CancellationToken cancellationToken)
    {
        var (keyId, keySecret) = await GetEffectiveKeysAsync(cancellationToken);
        return !string.IsNullOrWhiteSpace(keyId) && !string.IsNullOrWhiteSpace(keySecret);
    }

    public async Task<RazorpayOrderDto> CreateOrderAsync(Guid orderId, decimal amountInInr, CancellationToken cancellationToken)
    {
        var (keyId, keySecret) = await GetEffectiveKeysAsync(cancellationToken);
        if (string.IsNullOrWhiteSpace(keyId) || string.IsNullOrWhiteSpace(keySecret))
        {
            throw new InvalidOperationException("Razorpay is not configured — check IsConfiguredAsync before calling CreateOrderAsync.");
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
            Convert.ToBase64String(Encoding.UTF8.GetBytes($"{keyId}:{keySecret}")));

        var response = await httpClient.SendAsync(request, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new ConflictException($"Razorpay order creation failed ({response.StatusCode}): {body}");
        }

        using var document = JsonDocument.Parse(body);
        var razorpayOrderId = document.RootElement.GetProperty("id").GetString()
            ?? throw new ConflictException("Razorpay order creation response did not include an order id.");

        return new RazorpayOrderDto(razorpayOrderId, keyId, amountInPaise, "INR");
    }

    public async Task<bool> VerifyPaymentSignatureAsync(string razorpayOrderId, string razorpayPaymentId, string razorpaySignature, CancellationToken cancellationToken)
    {
        var (_, keySecret) = await GetEffectiveKeysAsync(cancellationToken);
        if (string.IsNullOrWhiteSpace(keySecret) || string.IsNullOrEmpty(razorpaySignature))
        {
            return false;
        }

        var expected = ComputeHmacHex($"{razorpayOrderId}|{razorpayPaymentId}", keySecret);
        return FixedTimeEquals(expected, razorpaySignature);
    }

    public async Task<bool> VerifyWebhookSignatureAsync(string rawBody, string signatureHeader, CancellationToken cancellationToken)
    {
        var webhookSecret = await GetEffectiveWebhookSecretAsync(cancellationToken);
        if (string.IsNullOrEmpty(webhookSecret) || string.IsNullOrEmpty(signatureHeader))
        {
            return false;
        }

        var expected = ComputeHmacHex(rawBody, webhookSecret);
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
