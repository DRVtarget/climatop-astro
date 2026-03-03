export const onRequestPost: PagesFunction<{
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  CONTACT_TO_EMAIL: string;
  CONTACT_FROM_EMAIL: string;
}> = async ({ request, env }) => {
  try {
    const formData = await request.formData();

    const name = String(formData.get("name") || "");
    const phone = String(formData.get("phone") || "");
    const city = String(formData.get("city") || "");
    const message = String(formData.get("message") || "");
    const token = String(formData.get("cf-turnstile-response") || "");

    if (!name || !phone || !message) {
      return new Response("Missing required fields", { status: 400 });
    }

    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET_KEY,
          response: token,
        }),
      }
    );

    const verify = await verifyRes.json();
    if (!verify.success) {
      return new Response("Bot verification failed", { status: 403 });
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL,
        to: [env.CONTACT_TO_EMAIL],
        subject: `New Climatop Lead (${city}) - ${name}`,
        html: `
          <h2>New Contact Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>City:</strong> ${city}</p>
          <p><strong>Message:</strong><br/>${message}</p>
        `,
      }),
    });

    if (!emailRes.ok) {
      return new Response("Email sending failed", { status: 500 });
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    return new Response("Server error", { status: 500 });
  }
};
