<!DOCTYPE html>
<html>
<head>
<style>
    body { font-family: DejaVu Sans, sans-serif; font-size: 13px; color: #1f2937; }
    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
    .header h1 { color: #1e40af; font-size: 20px; margin: 0; }
    .header p { font-size: 11px; color: #555; margin-top: 4px; }
    .section { margin-bottom: 18px; }
    .section h3 { background: #f4f6fb; padding: 6px 10px; border-left: 4px solid #1e40af; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 4px 8px; vertical-align: top; }
    .label { font-weight: bold; width: 180px; }
    .signatures { margin-top: 40px; display: flex; justify-content: space-between; }
    .sign-box { width: 45%; border-top: 1px solid #000; text-align: center; padding-top: 6px; font-size: 11px; }
    .applicant-photo-box { text-align: center; }
    .applicant-photo-box img {
        width: 110px; height: 110px; object-fit: cover;
        border-radius: 8px; border: 1px solid #ccc;
    }
    .terms-list { margin: 0; padding-left: 18px; font-size: 11.5px; line-height: 1.7; }
    .warning-box {
        background: #FEF3C7; padding: 10px 12px; border-radius: 6px;
        margin-top: 10px; border: 1px solid #FCD34D;
    }
    .warning-box p { font-size: 11px; color: #92400E; margin: 0; }
    .issued-by-box {
        background: #EFF6FF; padding: 8px 12px; border-radius: 6px;
        border: 1px solid #BFDBFE; margin-top: 6px;
    }
</style>
</head>
<body>
    <div class="header">
        <h1>MKATABA WA PIKIPIKI / MOTORCYCLE CONTRACT AGREEMENT</h1>
        <p>Contract Reference: #{{ $contract->id }} | Date: {{ $contract->created_at->format('d M Y') }}</p>
    </div>

    <div class="section">
        <h3>Client Information / Taarifa za Mteja</h3>
        <table>
            <tr>
                <td style="width: 70%;">
                    <table>
                        <tr><td class="label">Full Name</td><td>{{ $contract->user->full_name }}</td></tr>
                        <tr><td class="label">Phone</td><td>{{ $contract->user->phone }}</td></tr>
                        <tr><td class="label">Address</td><td>{{ $contract->user->address }}</td></tr>
                        <tr><td class="label">Email</td><td>{{ $contract->user->email }}</td></tr>
                    </table>
                </td>
                <td style="width: 30%;">
                    @if($contract->contractRequest && $contract->contractRequest->applicant_photo)
                    <div class="applicant-photo-box">
                        <img src="{{ public_path('storage/' . $contract->contractRequest->applicant_photo) }}" />
                        <p style="font-size: 10px; color: #666; margin-top: 4px;">Picha ya Mwombaji</p>
                    </div>
                    @endif
                </td>
            </tr>
        </table>
    </div>

    <div class="section">
        <h3>Motorcycle Details / Taarifa za Pikipiki</h3>
        <table>
            <tr><td class="label">Brand / Model</td><td>{{ $contract->motorcycle->brand }} {{ $contract->motorcycle->model }}</td></tr>
            <tr><td class="label">Year</td><td>{{ $contract->motorcycle->year }}</td></tr>
            <tr><td class="label">Condition</td><td>{{ ucfirst($contract->motorcycle->condition) }}</td></tr>
        </table>
    </div>

    <div class="section">
        <h3>Contract Terms / Masharti ya Malipo</h3>
        <table>
            <tr><td class="label">Start Date</td><td>{{ $contract->start_date->format('d M Y') }}</td></tr>
            <tr><td class="label">End Date</td><td>{{ $contract->end_date ? $contract->end_date->format('d M Y') : 'N/A' }}</td></tr>
            <tr><td class="label">Total Amount</td><td>TZS {{ number_format($contract->total_amount, 2) }}</td></tr>
            <tr><td class="label">Paid Amount</td><td>TZS {{ number_format($contract->paid_amount, 2) }}</td></tr>
            <tr><td class="label">Outstanding Balance</td><td>TZS {{ number_format($contract->balance, 2) }}</td></tr>
        </table>
    </div>

    <div class="section">
        <h3>Witness / Shahidi</h3>
        @foreach($contract->witnesses as $w)
        <table>
            <tr><td class="label">Full Name</td><td>{{ $w->full_name }}</td></tr>
            <tr><td class="label">NIDA Number</td><td>{{ $w->nida_number }}</td></tr>
            <tr><td class="label">Phone</td><td>{{ $w->phone }}</td></tr>
            <tr><td class="label">Address</td><td>{{ $w->address }}</td></tr>
        </table>
        @endforeach
    </div>

    <div class="section">
        <h3>Guarantor / Mdhamini</h3>
        @foreach($contract->guarantors as $g)
        <table>
            <tr><td class="label">Full Name</td><td>{{ $g->full_name }}</td></tr>
            <tr><td class="label">Phone</td><td>{{ $g->phone }}</td></tr>
            <tr><td class="label">Address</td><td>{{ $g->address }}</td></tr>
            <tr><td class="label">NIDA Number</td><td>{{ $g->nida_number }}</td></tr>
        </table>
        @endforeach
    </div>

    <div class="section" style="page-break-inside: avoid;">
        <h3>MASHARTI MUHIMU YA MKATABA</h3>
        <ol class="terms-list">
            <li>Mteja anawajibika kulipa kiasi kilichokubaliwa (cha kila siku au kila mwezi) ndani ya muda uliopangwa kwenye mkataba huu.</li>
            <li>Endapo Mteja atashindwa kulipa malipo yanayostahili kwa muda wa siku saba (7) mfululizo baada ya tarehe ya mwisho ya mkataba, bila taarifa rasmi au sababu za msingi zinazokubalika na Kampuni, Meneja ana haki kamili ya kusitisha mkataba huu mara moja.</li>
            <li><strong>Endapo mkataba utasitishwa kutokana na kuchelewa au kushindwa kulipa, pikipiki itarejeshwa mara moja kwa Kampuni, na malipo yote yaliyokwisha fanywa na Mteja hadi wakati huo HAYATARUDISHWA kwa namna yoyote ile.</strong> Malipo hayo yatachukuliwa kama fidia ya matumizi ya pikipiki na uchakavu uliojitokeza wakati wa matumizi.</li>
            <li>Mteja anawajibika kuitunza pikipiki katika hali nzuri na kuiendesha kwa mujibu wa sheria za usalama barabarani. Uharibifu wowote utakaosababishwa na uzembe utagharamiwa na Mteja.</li>
            <li>Shahidi na Mdhamini waliotajwa kwenye mkataba huu wanawajibika kushirikiana na Kampuni endapo Mteja atashindwa kutimiza wajibu wake wa kimkataba, ikiwa ni pamoja na kusaidia kupatikana kwa Mteja na/au pikipiki.</li>
            <li>Kampuni inayo haki ya kufuatilia na kudai malipo yaliyobaki hata baada ya mkataba kusitishwa, endapo uharibifu au hasara itatokea kwa upande wa Kampuni.</li>
            <li>Mkataba huu unasimamiwa na sheria za Jamhuri ya Muungano wa Tanzania.</li>
        </ol>

        <div class="warning-box">
            <p><strong>Onyo:</strong> Kwa kutia saini mkataba huu, Mteja anathibitisha kuwa amesoma, ameelewa, na anakubaliana na masharti yote yaliyoainishwa hapo juu.</p>
        </div>
    </div>

    <div class="section">
        <h3>Issued By / Imetolewa Na</h3>
        <div class="issued-by-box">
            <table>
                <tr><td class="label">Manager Name</td><td>{{ $contract->issuedBy->full_name ?? 'N/A' }}</td></tr>
                <tr><td class="label">Contact</td><td>{{ $contract->issuedBy->phone ?? 'N/A' }}</td></tr>
                <tr><td class="label">Issued On</td><td>{{ $contract->created_at->format('d M Y') }}</td></tr>
            </table>
        </div>
    </div>

    <div class="signatures">
        <div class="sign-box">Client Signature / Saini ya Mteja</div>
        <div class="sign-box">Manager Signature / Saini ya Meneja</div>
    </div>
</body>
</html>