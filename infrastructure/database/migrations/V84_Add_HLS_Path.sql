-- V84: Add support for HLS streaming paths
-- Este script adiciona a coluna hls_path na tabela lms_lessons para armazenar
-- a localização do arquivo playlist (.m3u8) para streaming via HLS e Cloudflare CDN.

-- Tabela: lms_lessons
-- Modificação: Nova coluna hls_path

ALTER TABLE lms_lessons 
ADD COLUMN hls_path VARCHAR(500) NULL AFTER video_ref;

-- Comentário para documentar o propósito no DDL
ALTER TABLE lms_lessons MODIFY COLUMN hls_path VARCHAR(500) COMMENT 'Caminho HLS gerado via FFmpeg (ex: hls/ID/master.m3u8)';
