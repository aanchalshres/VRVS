<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;



class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;
    use HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
   protected $fillable = [
    'role',
    'name',
    'email',
    'phone',
    'password',
    'email_verified_at',
    'is_active',
    'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

   // User.php

        public function ngoProfile()
        {
            return $this->hasOne(NgoProfile::class);
        }

        public function volunteerProfile()
        {
            return $this->hasOne(VolunteerProfile::class);
        }

        public function verificationWorkflow()
        {
            return $this->hasOne(VerificationWorkflow::class);
        }

        public function documents()
        {
            return $this->hasMany(Document::class);
        }

        public function verificationSessions()
        {
            return $this->hasMany(VerificationSession::class);
        }

        public function notifications()
        {
            return $this->hasMany(Notification::class);
        }

        public function createdTasks()
        {
            return $this->hasMany(Task::class, 'created_by');
        }

        public function reviewedApplications()
        {
            return $this->hasMany(Application::class, 'reviewed_by');
        }

        public function reviewedDocuments()
        {
            return $this->hasMany(Document::class, 'reviewed_by');
        }

        public function reviewsGiven()
        {
            return $this->hasMany(Review::class, 'reviewer_id');
        }

        public function reviewsReceived()
        {
            return $this->hasMany(Review::class, 'reviewee_id');
        }

        public function reportsMade()
        {
            return $this->hasMany(Report::class, 'reported_by');
        }

        public function resolvedReports()
        {
            return $this->hasMany(Report::class, 'resolved_by');
        }

        public function activityLogs()
        {
            return $this->hasMany(ActivityLog::class);
        }

        public function badges()
        {
            return $this->belongsToMany(
                Badge::class,
                'user_badges'
            )->withPivot('awarded_at');
        }
}
