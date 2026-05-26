<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Badge extends Model
{
    protected $table = 'badges';
    protected $fillable = [
        'name',
        'description',
        'image_path',
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
