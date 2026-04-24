export const config = {
  runtime: 'nodejs',
};

export default function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sri Usha Vet & Pet Stores | Coming Soon</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;600&display=swap" rel="stylesheet">
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: 'Outfit', sans-serif;
                background: linear-gradient(135deg, #1a1c2c 0%, #4a192c 100%);
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                text-align: center;
            }
            .container {
                max-width: 600px;
                padding: 40px;
                background: rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(10px);
                border-radius: 30px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }
            h1 {
                font-size: 3rem;
                margin-bottom: 10px;
                background: linear-gradient(to right, #ff7e5f, #feb47b);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            p {
                font-size: 1.2rem;
                opacity: 0.8;
                line-height: 1.6;
            }
            .badge {
                display: inline-block;
                padding: 8px 16px;
                background: #ff7e5f;
                border-radius: 100px;
                font-size: 0.8rem;
                font-weight: 600;
                margin-bottom: 20px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .footer {
                margin-top: 30px;
                font-size: 0.9rem;
                opacity: 0.5;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="badge">Live Update in Progress</div>
            <h1>Sri Usha Vet & Pet Stores</h1>
            <p>Our premium pet care platform is currently receiving a major infrastructure upgrade. We'll be back online shortly with a brand-new experience for you and your pets.</p>
            <div class="footer">© 2026 Sri Usha Vet & Pet Stores. All rights reserved.</div>
        </div>
    </body>
    </html>
  `);
}
