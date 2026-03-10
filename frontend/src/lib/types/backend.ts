export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export interface Session {
  accessToken: string;
  refreshToken?: string;
  user: User;
  expiresAt?: number;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  displayName?: string;
  metadata?: Record<string, unknown>;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface AuthAdapter {
  signUp(credentials: SignUpCredentials): Promise<{ user: User | null; session: Session | null; error: string | null }>;
  signIn(credentials: SignInCredentials): Promise<{ user: User | null; session: Session | null; error: string | null }>;
  signOut(): Promise<{ error: string | null }>;
  getSession(): Promise<Session | null>;
  getUser(): Promise<User | null>;
  resetPassword(email: string): Promise<{ error: string | null }>;
  updateUser(data: Partial<User>): Promise<{ user: User | null; error: string | null }>;
  onAuthStateChange(callback: (user: User | null, session: Session | null) => void): () => void;
  signInWithProvider(provider: string, redirectTo?: string): void;
  getSessionFromUrl(): Promise<{ session: Session | null; error: string | null }>;
}

export interface StorageUploadOptions {
  contentType?: string;
  upsert?: boolean;
  cacheControl?: string;
}

export interface StorageAdapter {
  upload(bucket: string, path: string, file: File | Blob, options?: StorageUploadOptions): Promise<{ url: string | null; error: string | null }>;
  download(bucket: string, path: string): Promise<{ data: Blob | null; error: string | null }>;
  remove(bucket: string, paths: string[]): Promise<{ error: string | null }>;
  getPublicUrl(bucket: string, path: string): string;
  list(bucket: string, path?: string): Promise<{ data: StorageFile[] | null; error: string | null }>;
}

export interface StorageFile {
  name: string;
  id?: string;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
  mimeType?: string;
}

export interface QueryOptions {
  select?: string;
  where?: Record<string, unknown>;
  orderBy?: { column: string; ascending?: boolean }[];
  limit?: number;
  offset?: number;
}

export interface MutationResult<T = unknown> {
  data: T | null;
  error: string | null;
}

export interface DatabaseAdapter {
  query<T = unknown>(table: string, options?: QueryOptions): Promise<MutationResult<T[]>>;
  queryById<T = unknown>(table: string, id: string): Promise<MutationResult<T>>;
  insert<T = unknown>(table: string, data: Record<string, unknown>): Promise<MutationResult<T>>;
  update<T = unknown>(table: string, id: string, data: Record<string, unknown>): Promise<MutationResult<T>>;
  remove(table: string, id: string): Promise<MutationResult<null>>;
  rpc<T = unknown>(functionName: string, params?: Record<string, unknown>): Promise<MutationResult<T>>;
}

export interface RealtimeChannel {
  subscribe(): RealtimeChannel;
  unsubscribe(): void;
  on(event: string, callback: (payload: unknown) => void): RealtimeChannel;
  send(event: string, payload: unknown): void;
}

export interface RealtimeAdapter {
  channel(name: string): RealtimeChannel;
  removeChannel(name: string): void;
  removeAllChannels(): void;
}

export interface FunctionsAdapter {
  invoke<T = unknown>(functionName: string, body?: Record<string, unknown>): Promise<MutationResult<T>>;
}

export interface AppRole {
  id: string;
  name: string;
  label: string;
  description: string;
  level: number;
  is_system: boolean;
}

export interface AppPermission {
  id: string;
  name: string;
  label: string;
  description: string;
  resource: string;
  action: string;
}

export interface AppUserRole {
  user_id: string;
  role_id: string;
  assigned_at: string;
  assigned_by: string | null;
  role?: AppRole;
}

export interface BackendClient {
  auth: AuthAdapter;
  db: DatabaseAdapter;
  storage: StorageAdapter;
  realtime: RealtimeAdapter;
  functions: FunctionsAdapter;
}
