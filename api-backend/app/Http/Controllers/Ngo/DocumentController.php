<?php

namespace App\Http\Controllers\Ngo;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $profile = $request->user()->ngoProfile;

        return response()->json([
            'data' => $profile->documents()
                ->orderBy('created_at', 'desc')
                ->get()
        ]);
    }

    public function store(Request $request)
    {
        $profile = $request->user()->ngoProfile;

        $validated = $request->validate([
            'document' => 'required|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:10240',
            'document_type' => 'required|string|in:registration_certificate,pan_document,letterhead,other',
        ]);

        $file = $request->file('document');
        $filePath = $file->store('ngo-documents', 'public');

        $document = $profile->documents()->create([
            'document_type' => $validated['document_type'],
            'original_name' => $file->getClientOriginalName(),
            'file_name' => $file->hashName(),
            'file_path' => $filePath,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Document uploaded',
            'data' => $document
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $profile = $request->user()->ngoProfile;

        $document = $profile->documents()->findOrFail($id);

        if (!Storage::disk('public')->exists($document->file_path)) {
            return response()->json([
                'message' => 'File not found'
            ], 404);
        }

        return Storage::disk('public')->download(
            $document->file_path,
            $document->original_name
        );
    }

    public function destroy(Request $request, $id)
    {
        $profile = $request->user()->ngoProfile;

        $document = $profile->documents()->findOrFail($id);

        Storage::disk('public')->delete($document->file_path);

        $document->delete();

        return response()->json([
            'message' => 'Document deleted'
        ]);
    }
}
