<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $table = 'notifications';
    protected $fillable = [
        'user_id',
        'message',
        'is_read',
    ];

    // Notification.php

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
