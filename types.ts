export interface Song {
  id: string;
  art: string;
  custom_fields: any[];
  text: string;
  artist: string;
  title: string;
  album: string;
  genre: string;
  isrc: string;
  lyrics: string;
}

export interface Listeners {
  total: number;
  unique: number;
  current: number;
}

export interface Mount {
  id: number;
  name: string;
  url: string;
  bitrate: number;
  format: string;
  listeners: Listeners;
  path: string;
  is_default: boolean;
}

export interface Station {
  id: number;
  name: string;
  shortcode: string;
  description: string;
  frontend: string;
  backend: string;
  timezone: string;
  listen_url: string;
  url: string;
  public_player_url: string;
  playlist_pls_url: string;
  playlist_m3u_url: string;
  is_public: boolean;
  mounts: Mount[];
  remotes: any[];
  hls_enabled: boolean;
  hls_is_default: boolean;
  hls_url: string;
  hls_listeners: number;
}

export interface Live {
  is_live: boolean;
  streamer_name: string;
  broadcast_start: number | null;
  art: string | null;
}

export interface NowPlaying {
  sh_id: number;
  played_at: number;
  duration: number;
  playlist: string | null;
  streamer: string | null;
  is_request: boolean;
  song: Song;
  elapsed: number;
  remaining: number;
}

export interface PlayingNext {
  cued_at: number;
  played_at: number;
  duration: number;
  playlist: string | null;
  is_request: boolean;
  song: Song;
}

export interface SongHistory {
  sh_id: number;
  played_at: number;
  duration: number;
  playlist: string | null;
  streamer: string | null;
  is_request: boolean;
  song: Song;
}

export interface StationNowPlaying {
  station: Station;
  listeners: Listeners;
  live: Live;
  now_playing: NowPlaying;
  playing_next: PlayingNext | null;
  song_history: SongHistory[];
  is_online: boolean;
  cache: any | null;
}

export interface StationItem {
  slot: string;
  label: string;
  stationUrl: string;
}