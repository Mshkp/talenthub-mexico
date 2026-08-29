class SecurityHeadersMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        response.setdefault("X-Content-Type-Options", "nosniff")
        response.setdefault("X-Frame-Options", "DENY")
        response.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.setdefault(
            "Permissions-Policy",
            "camera=(), microphone=(), geolocation=(), fullscreen=(self), payment=(self)",
        )
        response.setdefault(
            "Content-Security-Policy",
            (
                "default-src 'self'; "
                "base-uri 'self'; "
                "object-src 'none'; "
                "frame-ancestors 'none'; "
                "form-action 'self'; "
                "img-src 'self' https://talenthub-mexico.onrender.com https://www.paypal.com https://www.paypalobjects.com; "
                "font-src 'self'; "
                "style-src 'self' https://www.paypal.com https://www.paypalobjects.com; "
                "script-src 'self' https://www.paypal.com https://www.paypalobjects.com; "
                "connect-src 'self' https://talenthub-mexico.onrender.com https://talent-hub.me https://www.talent-hub.me https://api-m.sandbox.paypal.com https://api-m.paypal.com; "
                "frame-src 'self' https://www.paypal.com https://www.sandbox.paypal.com;"
            ),
        )

        if request.path.startswith("/api/"):
            response.setdefault("Cache-Control", "no-store")

        return response
