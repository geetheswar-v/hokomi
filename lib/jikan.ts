/**
 * JikanAPI - A comprehensive TypeScript wrapper for the Jikan API v4
 * 
 * Jikan is an unofficial MyAnimeList API that provides access to anime, manga, 
 * character, and user data from MyAnimeList.net
 * 
 * Features:
 * - Full TypeScript support with proper type definitions
 * - Comprehensive endpoint coverage including anime, manga, characters, people, users, clubs
 * - Search functionality with advanced filters
 * - Top rankings and seasonal data
 * - Recommendations and reviews
 * - User profiles and statistics
 * - Random data endpoints
 * - Watch episodes and promos
 * 
 * Usage Examples:
 * 
 * // Search for anime
 * const searchResults = await JikanAPI.searchAnime({
 *   q: 'Naruto',
 *   type: 'tv',
 *   status: 'complete',
 *   order_by: 'score',
 *   sort: 'desc'
 * });
 * 
 * // Get top anime
 * const topAnime = await JikanAPI.getTopAnime({
 *   type: 'tv',
 *   filter: 'bypopularity',
 *   limit: 25
 * });
 * 
 * // Get anime by ID
 * const anime = await JikanAPI.getAnime(1);
 * 
 * // Search manga with filters
 * const mangaResults = await JikanAPI.searchManga({
 *   q: 'One Piece',
 *   type: 'manga',
 *   status: 'publishing',
 *   order_by: 'score',
 *   sort: 'desc'
 * });
 * 
 * // Get seasonal anime
 * const seasonalAnime = await JikanAPI.getSeasonalAnime({
 *   year: 2024,
 *   season: 'winter'
 * });
 * 
 * // Get character information
 * const character = await JikanAPI.getCharacter(1);
 * 
 * // Get user profile
 * const user = await JikanAPI.getUserProfile('username');
 * 
 * // Get recommendations
 * const recommendations = await JikanAPI.getRecentAnimeRecommendations();
 * 
 * Rate Limiting:
 * - The public Jikan API has rate limiting, so be mindful of your request frequency
 * - It's recommended to implement proper error handling and retry logic
 * 
 * API Documentation: https://docs.api.jikan.moe/
 * GitHub: https://github.com/jikan-me/jikan-rest
 */

const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

// Types for API responses
export interface PaginationData {
    last_visible_page: number;
    has_next_page: boolean;
    items: {
        count: number;
        total: number;
        per_page: number;
    };
}

export interface JikanResponse<T> {
    data: T;
    pagination?: PaginationData;
}

export interface AnimeSearchParams {
    q?: string;
    page?: number;
    limit?: number;
    type?: 'tv' | 'movie' | 'ova' | 'special' | 'ona' | 'music';
    score?: number;
    min_score?: number;
    max_score?: number;
    status?: 'airing' | 'complete' | 'upcoming';
    rating?: 'g' | 'pg' | 'pg13' | 'r17' | 'r' | 'rx';
    sfw?: boolean;
    genres?: string;
    genres_exclude?: string;
    order_by?: 'mal_id' | 'title' | 'start_date' | 'end_date' | 'episodes' | 'score' | 'scored_by' | 'rank' | 'popularity' | 'members' | 'favorites';
    sort?: 'desc' | 'asc';
    letter?: string;
    producers?: string;
    start_date?: string;
    end_date?: string;
    [key: string]: unknown;
}

export interface MangaSearchParams {
    q?: string;
    page?: number;
    limit?: number;
    type?: 'manga' | 'novel' | 'lightnovel' | 'oneshot' | 'doujin' | 'manhwa' | 'manhua';
    score?: number;
    min_score?: number;
    max_score?: number;
    status?: 'publishing' | 'complete' | 'hiatus' | 'discontinued' | 'upcoming';
    sfw?: boolean;
    genres?: string;
    genres_exclude?: string;
    order_by?: 'mal_id' | 'title' | 'start_date' | 'end_date' | 'chapters' | 'volumes' | 'score' | 'scored_by' | 'rank' | 'popularity' | 'members' | 'favorites';
    sort?: 'desc' | 'asc';
    letter?: string;
    magazines?: string;
    start_date?: string;
    end_date?: string;
    [key: string]: unknown;
}

export interface TopAnimeParams {
    type?: 'tv' | 'movie' | 'ova' | 'special' | 'ona' | 'music';
    filter?: 'airing' | 'upcoming' | 'bypopularity' | 'favorite';
    rating?: 'g' | 'pg' | 'pg13' | 'r17' | 'r' | 'rx';
    sfw?: boolean;
    page?: number;
    limit?: number;
    [key: string]: unknown;
}

export interface TopMangaParams {
    type?: 'manga' | 'novel' | 'lightnovel' | 'oneshot' | 'doujin' | 'manhwa' | 'manhua';
    filter?: 'publishing' | 'upcoming' | 'bypopularity' | 'favorite';
    page?: number;
    limit?: number;
    [key: string]: unknown;
}

export interface SeasonParams {
    year: number;
    season: 'winter' | 'spring' | 'summer' | 'fall';
    page?: number;
    limit?: number;
    [key: string]: unknown;
}

export interface AnimeData {
    mal_id: number;
    url: string;
    images: {
        jpg: {
            image_url: string;
            small_image_url: string;
            large_image_url: string;
        };
        webp: {
            image_url: string;
            small_image_url: string;
            large_image_url: string;
        };
    };
    title: string;
    title_english?: string;
    title_japanese?: string;
    title_synonyms: string[];
    type: string;
    source: string;
    episodes?: number;
    status: string;
    airing: boolean;
    aired: {
        from: string;
        to: string;
        prop: {
            from: { day: number; month: number; year: number };
            to: { day: number; month: number; year: number };
        };
    };
    duration: string;
    rating: string;
    score?: number;
    scored_by?: number;
    rank?: number;
    popularity: number;
    members: number;
    favorites: number;
    synopsis?: string;
    background?: string;
    season?: string;
    year?: number;
    broadcast?: {
        day: string;
        time: string;
        timezone: string;
        string: string;
    };
    producers: Array<{ mal_id: number; name: string; url: string }>;
    licensors: Array<{ mal_id: number; name: string; url: string }>;
    studios: Array<{ mal_id: number; name: string; url: string }>;
    genres: Array<{ mal_id: number; name: string; url: string }>;
    themes: Array<{ mal_id: number; name: string; url: string }>;
    demographics: Array<{ mal_id: number; name: string; url: string }>;
}

export interface MangaData {
    mal_id: number;
    url: string;
    images: {
        jpg: {
            image_url: string;
            small_image_url: string;
            large_image_url: string;
        };
        webp: {
            image_url: string;
            small_image_url: string;
            large_image_url: string;
        };
    };
    title: string;
    title_english?: string;
    title_japanese?: string;
    title_synonyms: string[];
    type: string;
    chapters?: number;
    volumes?: number;
    status: string;
    publishing: boolean;
    published: {
        from: string;
        to: string;
        prop: {
            from: { day: number; month: number; year: number };
            to: { day: number; month: number; year: number };
        };
    };
    score?: number;
    scored_by?: number;
    rank?: number;
    popularity: number;
    members: number;
    favorites: number;
    synopsis?: string;
    background?: string;
    authors: Array<{ mal_id: number; name: string; url: string }>;
    serializations: Array<{ mal_id: number; name: string; url: string }>;
    genres: Array<{ mal_id: number; name: string; url: string }>;
    themes: Array<{ mal_id: number; name: string; url: string }>;
    demographics: Array<{ mal_id: number; name: string; url: string }>;
}

export interface RecommendationData {
    entry: {
        mal_id: number;
        url: string;
        images: {
            jpg: {
                image_url: string;
                small_image_url: string;
                large_image_url: string;
            };
            webp: {
                image_url: string;
                small_image_url: string;
                large_image_url: string;
            };
        };
        title: string;
    };
    url: string;
    votes: number;
}

export interface CharacterData {
    mal_id: number;
    url: string;
    images: {
        jpg: {
            image_url: string;
            small_image_url: string;
        };
        webp: {
            image_url: string;
            small_image_url: string;
        };
    };
    name: string;
    name_kanji?: string;
    nicknames: string[];
    favorites: number;
    about?: string;
}

export interface PersonData {
    mal_id: number;
    url: string;
    website_url?: string;
    images: {
        jpg: {
            image_url: string;
        };
    };
    name: string;
    given_name?: string;
    family_name?: string;
    alternate_names: string[];
    birthday?: string;
    favorites: number;
    about?: string;
}

export interface EpisodeData {
    mal_id: number;
    url: string;
    title: string;
    title_japanese?: string;
    title_romanji?: string;
    duration?: number;
    aired?: string;
    filler: boolean;
    recap: boolean;
    forum_url?: string;
    synopsis?: string;
}

export interface NewsData {
    mal_id: number;
    url: string;
    title: string;
    date: string;
    author_username: string;
    author_url: string;
    forum_url: string;
    images: {
        jpg: {
            image_url: string;
        };
    };
    comments: number;
    excerpt: string;
}

export interface PictureData {
    image_url: string;
    small_image_url: string;
    large_image_url: string;
}

export interface VideoData {
    promo: Array<{
        title: string;
        trailer: {
            youtube_id: string;
            url: string;
            embed_url: string;
        };
    }>;
    episodes: Array<{
        mal_id: number;
        url: string;
        title: string;
        episode: string;
        images: {
            jpg: {
                image_url: string;
            };
        };
    }>;
    music_videos: Array<{
        title: string;
        video: {
            youtube_id: string;
            url: string;
            embed_url: string;
        };
        meta: {
            title?: string;
            author?: string;
        };
    }>;
}

export interface StatisticsData {
    watching?: number;
    completed?: number;
    on_hold?: number;
    dropped?: number;
    plan_to_watch?: number;
    total: number;
    scores: Array<{
        score: number;
        votes: number;
        percentage: number;
    }>;
}

export interface UserUpdateData {
    user: {
        username: string;
        url: string;
        images: {
            jpg: {
                image_url: string;
            };
            webp: {
                image_url: string;
            };
        };
    };
    score?: number;
    status: string;
    episodes_seen?: number;
    episodes_total?: number;
    chapters_read?: number;
    chapters_total?: number;
    volumes_read?: number;
    volumes_total?: number;
    date: string;
}

export interface ReviewData {
    mal_id: number;
    url: string;
    type: string;
    date: string;
    review: string;
    score: number;
    tags: string[];
    is_spoiler: boolean;
    is_preliminary: boolean;
    episodes_watched?: number;
    chapters_read?: number;
    user: {
        url: string;
        username: string;
        images: {
            jpg: {
                image_url: string;
            };
            webp: {
                image_url: string;
            };
        };
    };
}

export interface RelationData {
    relation: string;
    entry: Array<{
        mal_id: number;
        type: string;
        name: string;
        url: string;
    }>;
}

export interface ThemeData {
    openings: string[];
    endings: string[];
}

export interface ExternalLinkData {
    name: string;
    url: string;
}

export interface StreamingData {
    name: string;
    url: string;
}

export interface GenreData {
    mal_id: number;
    name: string;
    url: string;
    count: number;
}

export interface ProducerData {
    mal_id: number;
    url: string;
    name: string;
    established?: string;
    about?: string;
    count: number;
}


export class JikanAPI {
    private static async fetch<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${JIKAN_BASE_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`Jikan API error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }

    private static buildQuery(params: Record<string, unknown>): string {
        const query = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null) {
                query.append(key, value.toString());
            }
        }
        return query.toString();
    }

    // ANIME ENDPOINTS
    
    /**
     * Get anime by ID
     */
    static async getAnime(id: number): Promise<JikanResponse<AnimeData>> {
        return this.fetch<JikanResponse<AnimeData>>(`/anime/${id}`);
    }

    /**
     * Get full anime data by ID
     */
    static async getAnimeFullData(id: number): Promise<JikanResponse<AnimeData>> {
        return this.fetch<JikanResponse<AnimeData>>(`/anime/${id}/full`);
    }

    /**
     * Get anime characters
     */
    static async getAnimeCharacters(id: number): Promise<JikanResponse<CharacterData[]>> {
        return this.fetch<JikanResponse<CharacterData[]>>(`/anime/${id}/characters`);
    }

    /**
     * Get anime staff
     */
    static async getAnimeStaff(id: number): Promise<JikanResponse<PersonData[]>> {
        return this.fetch<JikanResponse<PersonData[]>>(`/anime/${id}/staff`);
    }

    /**
     * Get anime episodes
     */
    static async getAnimeEpisodes(id: number, page?: number): Promise<JikanResponse<EpisodeData[]>> {
        const query = page ? `?page=${page}` : '';
        return this.fetch<JikanResponse<EpisodeData[]>>(`/anime/${id}/episodes${query}`);
    }

    /**
     * Get anime episode by ID
     */
    static async getAnimeEpisode(animeId: number, episodeId: number): Promise<JikanResponse<EpisodeData>> {
        return this.fetch<JikanResponse<EpisodeData>>(`/anime/${animeId}/episodes/${episodeId}`);
    }

    /**
     * Get anime news
     */
    static async getAnimeNews(id: number, page?: number): Promise<JikanResponse<NewsData[]>> {
        const query = page ? `?page=${page}` : '';
        return this.fetch<JikanResponse<NewsData[]>>(`/anime/${id}/news${query}`);
    }

    /**
     * Get anime pictures
     */
    static async getAnimePictures(id: number): Promise<JikanResponse<PictureData[]>> {
        return this.fetch<JikanResponse<PictureData[]>>(`/anime/${id}/pictures`);
    }

    /**
     * Get anime videos
     */
    static async getAnimeVideos(id: number): Promise<JikanResponse<VideoData>> {
        return this.fetch<JikanResponse<VideoData>>(`/anime/${id}/videos`);
    }

    /**
     * Get anime statistics
     */
    static async getAnimeStats(id: number): Promise<JikanResponse<StatisticsData>> {
        return this.fetch<JikanResponse<StatisticsData>>(`/anime/${id}/statistics`);
    }

    /**
     * Get anime recommendations
     */
    static async getAnimeRecommendations(id: number): Promise<JikanResponse<RecommendationData[]>> {
        return this.fetch<JikanResponse<RecommendationData[]>>(`/anime/${id}/recommendations`);
    }

    /**
     * Get anime user updates
     */
    static async getAnimeUserUpdates(id: number, page?: number): Promise<JikanResponse<UserUpdateData[]>> {
        const query = page ? `?page=${page}` : '';
        return this.fetch<JikanResponse<UserUpdateData[]>>(`/anime/${id}/userupdates${query}`);
    }

    /**
     * Get anime reviews
     */
    static async getAnimeReviews(id: number, page?: number): Promise<JikanResponse<ReviewData[]>> {
        const query = page ? `?page=${page}` : '';
        return this.fetch<JikanResponse<ReviewData[]>>(`/anime/${id}/reviews${query}`);
    }

    /**
     * Get anime relations
     */
    static async getAnimeRelations(id: number): Promise<JikanResponse<RelationData[]>> {
        return this.fetch<JikanResponse<RelationData[]>>(`/anime/${id}/relations`);
    }

    /**
     * Get anime themes
     */
    static async getAnimeThemes(id: number): Promise<JikanResponse<ThemeData>> {
        return this.fetch<JikanResponse<ThemeData>>(`/anime/${id}/themes`);
    }

    /**
     * Get anime external links
     */
    static async getAnimeExternal(id: number): Promise<JikanResponse<ExternalLinkData[]>> {
        return this.fetch<JikanResponse<ExternalLinkData[]>>(`/anime/${id}/external`);
    }

    /**
     * Get anime streaming links
     */
    static async getAnimeStreaming(id: number): Promise<JikanResponse<StreamingData[]>> {
        return this.fetch<JikanResponse<StreamingData[]>>(`/anime/${id}/streaming`);
    }

    /**
     * Search anime with filters
     */
    static async searchAnime(params: AnimeSearchParams = {}): Promise<JikanResponse<AnimeData[]>> {
        const query = this.buildQuery(params);
        return this.fetch<JikanResponse<AnimeData[]>>(`/anime?${query}`);
    }

    // MANGA ENDPOINTS

    /**
     * Get manga by ID
     */
    static async getManga(id: number): Promise<JikanResponse<MangaData>> {
        return this.fetch<JikanResponse<MangaData>>(`/manga/${id}`);
    }

    /**
     * Get full manga data by ID
     */
    static async getMangaFullData(id: number): Promise<JikanResponse<MangaData>> {
        return this.fetch<JikanResponse<MangaData>>(`/manga/${id}/full`);
    }

    /**
     * Get manga characters
     */
    static async getMangaCharacters(id: number): Promise<JikanResponse<CharacterData[]>> {
        return this.fetch<JikanResponse<CharacterData[]>>(`/manga/${id}/characters`);
    }

    /**
     * Get manga news
     */
    static async getMangaNews(id: number, page?: number): Promise<JikanResponse<NewsData[]>> {
        const query = page ? `?page=${page}` : '';
        return this.fetch<JikanResponse<NewsData[]>>(`/manga/${id}/news${query}`);
    }

    /**
     * Get manga pictures
     */
    static async getMangaPictures(id: number): Promise<JikanResponse<PictureData[]>> {
        return this.fetch<JikanResponse<PictureData[]>>(`/manga/${id}/pictures`);
    }

    /**
     * Get manga statistics
     */
    static async getMangaStats(id: number): Promise<JikanResponse<StatisticsData>> {
        return this.fetch<JikanResponse<StatisticsData>>(`/manga/${id}/statistics`);
    }

    /**
     * Get manga recommendations
     */
    static async getMangaRecommendations(id: number): Promise<JikanResponse<RecommendationData[]>> {
        return this.fetch<JikanResponse<RecommendationData[]>>(`/manga/${id}/recommendations`);
    }

    /**
     * Get manga user updates
     */
    static async getMangaUserUpdates(id: number, page?: number): Promise<JikanResponse<UserUpdateData[]>> {
        const query = page ? `?page=${page}` : '';
        return this.fetch<JikanResponse<UserUpdateData[]>>(`/manga/${id}/userupdates${query}`);
    }

    /**
     * Get manga reviews
     */
    static async getMangaReviews(id: number, page?: number): Promise<JikanResponse<ReviewData[]>> {
        const query = page ? `?page=${page}` : '';
        return this.fetch<JikanResponse<ReviewData[]>>(`/manga/${id}/reviews${query}`);
    }

    /**
     * Get manga relations
     */
    static async getMangaRelations(id: number): Promise<JikanResponse<RelationData[]>> {
        return this.fetch<JikanResponse<RelationData[]>>(`/manga/${id}/relations`);
    }

    /**
     * Get manga external links
     */
    static async getMangaExternal(id: number): Promise<JikanResponse<ExternalLinkData[]>> {
        return this.fetch<JikanResponse<ExternalLinkData[]>>(`/manga/${id}/external`);
    }

    /**
     * Search manga with filters
     */
    static async searchManga(params: MangaSearchParams = {}): Promise<JikanResponse<MangaData[]>> {
        const query = this.buildQuery(params);
        return this.fetch<JikanResponse<MangaData[]>>(`/manga?${query}`);
    }

    // TOP RANKINGS

    /**
     * Get top anime
     */
    static async getTopAnime(params: TopAnimeParams = {}): Promise<JikanResponse<AnimeData[]>> {
        const query = this.buildQuery(params);
        return this.fetch<JikanResponse<AnimeData[]>>(`/top/anime?${query}`);
    }

    /**
     * Get top manga
     */
    static async getTopManga(params: TopMangaParams = {}): Promise<JikanResponse<MangaData[]>> {
        const query = this.buildQuery(params);
        return this.fetch<JikanResponse<MangaData[]>>(`/top/manga?${query}`);
    }

    // SEASONS

    /**
     * Get seasonal anime
     */
    static async getSeasonalAnime(params: SeasonParams): Promise<JikanResponse<AnimeData[]>> {
        const { year, season, ...rest } = params;
        const query = this.buildQuery(rest);
        return this.fetch<JikanResponse<AnimeData[]>>(`/seasons/${year}/${season}?${query}`);
    }

    /**
     * Get current season anime
     */
    static async getCurrentSeasonAnime(page?: number): Promise<JikanResponse<AnimeData[]>> {
        const query = page ? `?page=${page}` : '';
        return this.fetch<JikanResponse<AnimeData[]>>(`/seasons/now${query}`);
    }

    /**
     * Get upcoming season anime
     */
    static async getUpcomingSeasonAnime(page?: number): Promise<JikanResponse<AnimeData[]>> {
        const query = page ? `?page=${page}` : '';
        return this.fetch<JikanResponse<AnimeData[]>>(`/seasons/upcoming${query}`);
    }

    /**
     * Get all seasons list
     */
    static async getSeasonsList(): Promise<JikanResponse<{ year: number; seasons: string[] }[]>> {
        return this.fetch<JikanResponse<{ year: number; seasons: string[] }[]>>('/seasons');
    }

    // SCHEDULES

    /**
     * Get anime schedule
     */
    static async getAnimeSchedule(day?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'): Promise<JikanResponse<AnimeData[]>> {
        const query = day ? `?filter=${day}` : '';
        return this.fetch<JikanResponse<AnimeData[]>>(`/schedules${query}`);
    }

    // CHARACTERS

    /**
     * Get character by ID
     */
    static async getCharacter(id: number): Promise<JikanResponse<CharacterData>> {
        return this.fetch<JikanResponse<CharacterData>>(`/characters/${id}`);
    }

    /**
     * Get character full data
     */
    static async getCharacterFullData(id: number): Promise<JikanResponse<CharacterData>> {
        return this.fetch<JikanResponse<CharacterData>>(`/characters/${id}/full`);
    }

    /**
     * Get character anime
     */
    static async getCharacterAnime(id: number): Promise<JikanResponse<AnimeData[]>> {
        return this.fetch<JikanResponse<AnimeData[]>>(`/characters/${id}/anime`);
    }

    /**
     * Get character manga
     */
    static async getCharacterManga(id: number): Promise<JikanResponse<MangaData[]>> {
        return this.fetch<JikanResponse<MangaData[]>>(`/characters/${id}/manga`);
    }

    /**
     * Get character voice actors
     */
    static async getCharacterVoiceActors(id: number): Promise<JikanResponse<PersonData[]>> {
        return this.fetch<JikanResponse<PersonData[]>>(`/characters/${id}/voices`);
    }

    /**
     * Get character pictures
     */
    static async getCharacterPictures(id: number): Promise<JikanResponse<PictureData[]>> {
        return this.fetch<JikanResponse<PictureData[]>>(`/characters/${id}/pictures`);
    }

    /**
     * Search characters
     */
    static async searchCharacters(params: { q?: string; page?: number; limit?: number; order_by?: string; sort?: 'asc' | 'desc'; letter?: string; [key: string]: unknown } = {}): Promise<JikanResponse<CharacterData[]>> {
        const query = this.buildQuery(params);
        return this.fetch<JikanResponse<CharacterData[]>>(`/characters?${query}`);
    }

    // PEOPLE

    /**
     * Get person by ID
     */
    static async getPerson(id: number): Promise<JikanResponse<PersonData>> {
        return this.fetch<JikanResponse<PersonData>>(`/people/${id}`);
    }

    /**
     * Get person full data
     */
    static async getPersonFullData(id: number): Promise<JikanResponse<PersonData>> {
        return this.fetch<JikanResponse<PersonData>>(`/people/${id}/full`);
    }

    /**
     * Get person anime
     */
    static async getPersonAnime(id: number): Promise<JikanResponse<AnimeData[]>> {
        return this.fetch<JikanResponse<AnimeData[]>>(`/people/${id}/anime`);
    }

    /**
     * Get person manga
     */
    static async getPersonManga(id: number): Promise<JikanResponse<MangaData[]>> {
        return this.fetch<JikanResponse<MangaData[]>>(`/people/${id}/manga`);
    }

    /**
     * Get person voice acting roles
     */
    static async getPersonVoices(id: number): Promise<JikanResponse<CharacterData[]>> {
        return this.fetch<JikanResponse<CharacterData[]>>(`/people/${id}/voices`);
    }

    /**
     * Get person pictures
     */
    static async getPersonPictures(id: number): Promise<JikanResponse<PictureData[]>> {
        return this.fetch<JikanResponse<PictureData[]>>(`/people/${id}/pictures`);
    }

    /**
     * Search people
     */
    static async searchPeople(params: { q?: string; page?: number; limit?: number; order_by?: string; sort?: 'asc' | 'desc'; letter?: string; [key: string]: unknown } = {}): Promise<JikanResponse<PersonData[]>> {
        const query = this.buildQuery(params);
        return this.fetch<JikanResponse<PersonData[]>>(`/people?${query}`);
    }

    // RECOMMENDATIONS

    /**
     * Get recent anime recommendations
     */
    static async getRecentAnimeRecommendations(page?: number): Promise<JikanResponse<RecommendationData[]>> {
        const query = page ? `?page=${page}` : '';
        return this.fetch<JikanResponse<RecommendationData[]>>(`/recommendations/anime${query}`);
    }

    /**
     * Get recent manga recommendations
     */
    static async getRecentMangaRecommendations(page?: number): Promise<JikanResponse<RecommendationData[]>> {
        const query = page ? `?page=${page}` : '';
        return this.fetch<JikanResponse<RecommendationData[]>>(`/recommendations/manga${query}`);
    }

    // GENRES

    /**
     * Get anime genres
     */
    static async getAnimeGenres(): Promise<JikanResponse<GenreData[]>> {
        return this.fetch<JikanResponse<GenreData[]>>('/genres/anime');
    }

    /**
     * Get manga genres
     */
    static async getMangaGenres(): Promise<JikanResponse<GenreData[]>> {
        return this.fetch<JikanResponse<GenreData[]>>('/genres/manga');
    }

    // PRODUCERS

    /**
     * Get producers
     */
    static async getProducers(page?: number): Promise<JikanResponse<ProducerData[]>> {
        const query = page ? `?page=${page}` : '';
        return this.fetch<JikanResponse<ProducerData[]>>(`/producers${query}`);
    }

    /**
     * Get producer by ID
     */
    static async getProducer(id: number): Promise<JikanResponse<ProducerData>> {
        return this.fetch<JikanResponse<ProducerData>>(`/producers/${id}`);
    }

    // RANDOM

    /**
     * Get random anime
     */
    static async getRandomAnime(): Promise<JikanResponse<AnimeData>> {
        return this.fetch<JikanResponse<AnimeData>>('/random/anime');
    }

    /**
     * Get random manga
     */
    static async getRandomManga(): Promise<JikanResponse<MangaData>> {
        return this.fetch<JikanResponse<MangaData>>('/random/manga');
    }

}