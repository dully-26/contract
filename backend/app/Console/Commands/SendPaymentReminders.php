<?php
namespace App\Console\Commands;

use App\Models\Contract;
use App\Services\NotificationService;
use Illuminate\Console\Command;

class SendPaymentReminders extends Command
{
    protected $signature = 'reminders:payments';
    protected $description = 'Notify users with overdue or upcoming contract balances';

    public function handle()
    {
        $overdue = Contract::where('status', 'active')
            ->whereDate('end_date', '<', now())
            ->where('balance', '>', 0)
            ->get();

        foreach ($overdue as $contract) {
            NotificationService::send(
                $contract->user_id,
                'Payment Overdue',
                "Your contract balance of TZS {$contract->balance} is overdue. Please make a payment.",
                'payment'
            );
        }

        $this->info("Sent {$overdue->count()} overdue reminders.");
    }
}