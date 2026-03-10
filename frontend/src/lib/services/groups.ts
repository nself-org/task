import { getBackend } from '../backend';
import type { BackendClient } from '../types/backend';
import { Tables } from '../utils/tables';
import type {
  ListGroup,
  CreateListGroupInput,
  UpdateListGroupInput,
} from '../types/lists';

export class GroupService {
  private backend: BackendClient;

  constructor(backendAdapter: BackendClient) {
    this.backend = backendAdapter;
  }

  async getGroups(): Promise<ListGroup[]> {
    const { data, error } = await this.backend.db.query<ListGroup>(Tables.LIST_GROUPS, {
      orderBy: [{ column: 'position', ascending: true }, { column: 'created_at', ascending: true }],
    });
    if (error) throw new Error(error);
    return (data as ListGroup[]) ?? [];
  }

  async createGroup(input: CreateListGroupInput): Promise<ListGroup> {
    const { data, error } = await this.backend.db.insert<ListGroup>(Tables.LIST_GROUPS, {
      title: input.title,
      color: input.color ?? '#6366f1',
      icon: input.icon ?? 'folder',
    });
    if (error || !data) throw new Error(error ?? 'Failed to create group');
    return data as ListGroup;
  }

  async updateGroup(id: string, input: UpdateListGroupInput): Promise<ListGroup> {
    const { data, error } = await this.backend.db.update<ListGroup>(Tables.LIST_GROUPS, id, {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.color !== undefined && { color: input.color }),
      ...(input.icon !== undefined && { icon: input.icon }),
      ...(input.position !== undefined && { position: input.position }),
    });
    if (error || !data) throw new Error(error ?? 'Failed to update group');
    return data as ListGroup;
  }

  async deleteGroup(id: string): Promise<void> {
    const { error } = await this.backend.db.remove(Tables.LIST_GROUPS, id);
    if (error) throw new Error(error);
  }
}

export const groupService = new GroupService(getBackend());
