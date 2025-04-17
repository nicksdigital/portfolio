import { mockUsers, mockArticles, mockCategories, mockTags } from '../testUtils';

// Create a mock db object
export const mockDb = {
  query: {
    users: {
      findFirst: jest.fn(({ where }) => {
        if (where?.email) {
          return mockUsers.admin.email === where.email ? mockUsers.admin : null;
        }
        if (where?.id) {
          return mockUsers.admin.id === where.id ? mockUsers.admin : null;
        }
        return null;
      }),
      findMany: jest.fn(() => [mockUsers.admin, mockUsers.author]),
    },
    articles: {
      findFirst: jest.fn(({ where }) => {
        if (where?.id) {
          return mockArticles.find(a => a.id === where.id) || null;
        }
        if (where?.slug) {
          return mockArticles.find(a => a.slug === where.slug) || null;
        }
        return null;
      }),
      findMany: jest.fn(() => mockArticles),
    },
    categories: {
      findFirst: jest.fn(({ where }) => {
        if (where?.id) {
          return mockCategories.find(c => c.id === where.id) || null;
        }
        if (where?.slug) {
          return mockCategories.find(c => c.slug === where.slug) || null;
        }
        return null;
      }),
      findMany: jest.fn(() => mockCategories),
    },
    tags: {
      findFirst: jest.fn(({ where }) => {
        if (where?.id) {
          return mockTags.find(t => t.id === where.id) || null;
        }
        if (where?.name) {
          return mockTags.find(t => t.name === where.name) || null;
        }
        return null;
      }),
      findMany: jest.fn(() => mockTags),
    },
  },
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  returning: jest.fn().mockImplementation(() => {
    return [{ id: 1, ...mockUsers.admin }];
  }),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  transaction: jest.fn().mockImplementation(async (callback) => {
    return await callback({
      query: {
        users: {
          findFirst: jest.fn(({ where }) => {
            if (where?.email) {
              return mockUsers.admin.email === where.email ? mockUsers.admin : null;
            }
            if (where?.id) {
              return mockUsers.admin.id === where.id ? mockUsers.admin : null;
            }
            return null;
          }),
        },
        articles: {
          findFirst: jest.fn(({ where }) => {
            if (where?.id) {
              return mockArticles.find(a => a.id === where.id) || null;
            }
            if (where?.slug) {
              return mockArticles.find(a => a.slug === where.slug) || null;
            }
            return null;
          }),
        },
        categories: {
          findFirst: jest.fn(({ where }) => {
            if (where?.id) {
              return mockCategories.find(c => c.id === where.id) || null;
            }
            if (where?.slug) {
              return mockCategories.find(c => c.slug === where.slug) || null;
            }
            return null;
          }),
        },
        tags: {
          findFirst: jest.fn(({ where }) => {
            if (where?.id) {
              return mockTags.find(t => t.id === where.id) || null;
            }
            if (where?.name) {
              return mockTags.find(t => t.name === where.name) || null;
            }
            return null;
          }),
        },
      },
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockImplementation(() => {
        return [{ id: 1, ...mockUsers.admin }];
      }),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
    });
  }),
  innerJoin: jest.fn().mockReturnThis(),
};

// Mock the database module
jest.mock('../../db', () => {
  return { db: mockDb };
});
