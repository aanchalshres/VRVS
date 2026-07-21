<?php

namespace App\Http\Controllers\Ngo;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json([
            'data' => $request->user()
                ->load('ngoProfile')
        ]);
    }


    public function update(Request $request)
    {
        $profile = $request->user()->ngoProfile;

        $profile->update(
            $request->validate([
                'organization_name'=>'sometimes|string',
                'office_location'=>'sometimes|string',
            ])
        );


        return response()->json([
            'message'=>'Profile updated',
            'data'=>$profile
        ]);
    }
}
