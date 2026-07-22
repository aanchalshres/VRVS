<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Certificate of Appreciation</title>
    <style>
        body {
            font-family: 'Georgia', serif;
            margin: 0;
            padding: 40px;
            background: #fff;
            color: #333;
        }
        .certificate {
            max-width: 800px;
            margin: 0 auto;
            border: 3px solid #4F46C8;
            padding: 50px;
            text-align: center;
            position: relative;
        }
        .certificate::before {
            content: '';
            position: absolute;
            top: 10px; left: 10px; right: 10px; bottom: 10px;
            border: 1px solid #ddd;
            pointer-events: none;
        }
        h1 {
            color: #4F46C8;
            font-size: 32px;
            margin-top: 0;
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        .subtitle {
            color: #666;
            font-size: 14px;
            margin-bottom: 30px;
        }
        .presented {
            font-size: 16px;
            color: #666;
            margin: 20px 0;
        }
        .volunteer-name {
            font-size: 36px;
            font-weight: bold;
            color: #111827;
            margin: 15px 0;
        }
        .for-text {
            font-size: 16px;
            color: #666;
            margin: 10px 0;
        }
        .task-title {
            font-size: 22px;
            font-weight: bold;
            color: #4F46C8;
            margin: 10px 0;
        }
        .details {
            margin: 25px 0;
            font-size: 14px;
            color: #666;
            line-height: 1.8;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #999;
        }
        .cert-number {
            font-size: 11px;
            color: #aaa;
            margin-top: 20px;
        }
        @media print {
            body { -webkit-print-color-adjust: exact; }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <h1>Certificate of Appreciation</h1>
        <p class="subtitle">This certificate is proudly presented to</p>
        <div class="volunteer-name">{{ $content['volunteer_name'] ?? 'Volunteer' }}</div>
        <p class="for-text">for their valuable contribution as a volunteer</p>
        <div class="task-title">{{ $content['task_title'] ?? 'Opportunity' }}</div>
        <div class="details">
            <p><strong>Organization:</strong> {{ $content['organization_name'] ?? $ngo->organization_name }}</p>
            @if(!empty($content['hours_contributed']) && $content['hours_contributed'] > 0)
                <p><strong>Hours Contributed:</strong> {{ $content['hours_contributed'] }} hours</p>
            @endif
            <p><strong>Date Issued:</strong> {{ \Carbon\Carbon::parse($certificate->issued_at)->format('F d, Y') }}</p>
        </div>
        <div class="footer">
            <div>
                <strong>{{ $ngo->organization_name }}</strong>
            </div>
            <div>
                Certificate #: {{ $certificate->certificate_number }}
            </div>
        </div>
        <div class="cert-number">This certificate was generated electronically.</div>
    </div>
</body>
</html>
