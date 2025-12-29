export enum AppMode {
  STYLES = 'STYLES',
  EDIT = 'EDIT',
  GENERATE = 'GENERATE'
}

export enum ImageSize {
  SIZE_1K = '1K',
  SIZE_2K = '2K',
  SIZE_4K = '4K'
}

export interface GeneratedImage {
  id: string;
  url: string;
  styleName?: string;
  prompt: string;
  isLoading?: boolean;
}

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  promptSuffix: string;
  color: string;
}

export interface GeminiError {
  message: string;
}