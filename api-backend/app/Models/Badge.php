<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Badge extends Model
{
    protected $table = 'badges';
    protected $fillable = [
        'name',
        'description',
        'icon',
        'minimum_hours',
    ];

    // Badge.php

    public function users()
    {
        return $this->belongsToMany(
            User::class,
            'user_badges'
        )->withPivot('awarded_at');
    }
}
