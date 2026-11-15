<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class ExportMarinaData extends Command
{
    protected $signature = 'marina:export-next {--path=storage/app/marina-next-export}';
    protected $description = 'Exporte les données et médias Marina Craft pour la migration Next.js';

    public function handle(): int
    {
        $target = base_path($this->option('path'));
        File::deleteDirectory($target);
        File::ensureDirectoryExists($target);
        // Les comptes, mots de passe et abonnements push ne sont pas exportés.
        $tables = [
            'categories', 'products', 'product_media', 'site_settings',
            'delivery_zones', 'orders', 'order_items', 'order_payments',
            'order_status_histories', 'stock_movements', 'notification_logs',
            'home_sections', 'pages', 'faqs',
        ];
        $payload = ['source' => 'MarinaV2', 'exported_at' => now()->toIso8601String(), 'tables' => []];
        foreach ($tables as $table) {
            if (!Schema::hasTable($table)) { $this->warn("Table absente : {$table}"); continue; }
            $payload['tables'][$table] = DB::table($table)->get()->map(fn ($row) => (array) $row)->all();
            $this->info($table . ' : ' . count($payload['tables'][$table]) . ' ligne(s)');
        }
        File::put($target . DIRECTORY_SEPARATOR . 'database.json',
            json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE));
        $disk = Storage::disk('public');
        $mediaRoot = $target . DIRECTORY_SEPARATOR . 'storage';
        File::ensureDirectoryExists($mediaRoot);
        $mediaFiles = $disk->allFiles();
        foreach ($mediaFiles as $file) {
            $destination = $mediaRoot . DIRECTORY_SEPARATOR . $file;
            File::ensureDirectoryExists(dirname($destination));
            File::copy($disk->path($file), $destination);
        }
        $this->info('Médias copiés : ' . count($mediaFiles));
        $this->info('Export terminé : ' . $target);
        if (class_exists(ZipArchive::class)) {
            $zipPath = $target . '.zip';
            $zip = new ZipArchive();
            if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
                $iterator = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($target, \FilesystemIterator::SKIP_DOTS));
                foreach ($iterator as $file) {
                    if ($file->isFile()) {
                        $local = substr($file->getPathname(), strlen($target) + 1);
                        $zip->addFile($file->getPathname(), $local);
                    }
                }
                $zip->close();
                $this->info('Archive créée : ' . $zipPath);
            }
        }
        return self::SUCCESS;
    }
}