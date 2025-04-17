import { mockUsers, mockArticles, mockCategories, mockTags } from '../testUtils';
import { eq, and, desc, sql } from 'drizzle-orm';

// Create a more comprehensive mock database
export const mockDb = {
  query: {
    users: {
      findFirst: jest.fn(({ where }) => {
        if (!where) return null;
        
        // Handle 'and' conditions
        if (where.hasOwnProperty('and')) {
          const conditions = where.and;
          return mockUsers.admin; // Simplified for testing
        }
        
        // Handle simple equality conditions
        for (const key in where) {
          if (key === 'email' && where[key] === mockUsers.admin.email) {
            return mockUsers.admin;
          }
          if (key === 'id' && where[key] === mockUsers.admin.id) {
            return mockUsers.admin;
          }
        }
        
        return null;
      }),
      findMany: jest.fn(() => [mockUsers.admin, mockUsers.author]),
    },
    articles: {
      findFirst: jest.fn(({ where }) => {
        if (!where) return null;
        
        // Handle 'and' conditions
        if (where.hasOwnProperty('and')) {
          const conditions = where.and;
          // For simplicity, just return the first article that matches the slug
          for (const condition of conditions) {
            if (condition.hasOwnProperty('eq') && condition.eq[0].hasOwnProperty('slug')) {
              const slug = condition.eq[1];
              return mockArticles.find(a => a.slug === slug && a.published);
            }
          }
        }
        
        // Handle simple equality conditions
        for (const key in where) {
          if (key === 'slug') {
            return mockArticles.find(a => a.slug === where[key] && a.published);
          }
          if (key === 'id') {
            return mockArticles.find(a => a.id === where[key]);
          }
        }
        
        return null;
      }),
      findMany: jest.fn(() => mockArticles.filter(a => a.published)),
    },
    categories: {
      findFirst: jest.fn(({ where }) => {
        if (!where) return null;
        
        for (const key in where) {
          if (key === 'slug') {
            return mockCategories.find(c => c.slug === where[key]);
          }
          if (key === 'id') {
            return mockCategories.find(c => c.id === where[key]);
          }
        }
        
        return null;
      }),
      findMany: jest.fn(() => mockCategories),
    },
    tags: {
      findFirst: jest.fn(({ where }) => {
        if (!where) return null;
        
        for (const key in where) {
          if (key === 'name') {
            return mockTags.find(t => t.name === where[key]);
          }
          if (key === 'id') {
            return mockTags.find(t => t.id === where[key]);
          }
        }
        
        return null;
      }),
      findMany: jest.fn(() => mockTags),
    },
    claps: {
      findFirst: jest.fn(({ where }) => {
        if (!where) return null;
        
        // Handle 'and' conditions
        if (where.hasOwnProperty('and')) {
          const conditions = where.and;
          // For simplicity, just return null (no existing claps)
          return null;
        }
        
        return null;
      }),
      findMany: jest.fn(() => []),
    },
    annotations: {
      findFirst: jest.fn(({ where }) => {
        if (!where) return null;
        
        // Handle 'and' conditions
        if (where.hasOwnProperty('and')) {
          const conditions = where.and;
          // For simplicity, just return null (no existing annotations)
          return null;
        }
        
        return null;
      }),
      findMany: jest.fn(() => []),
    },
    sessions: {
      findFirst: jest.fn(({ where }) => {
        if (!where) return null;
        
        for (const key in where) {
          if (key === 'token') {
            // For simplicity, just return a session for any token
            return {
              id: 1,
              userId: mockUsers.admin.id,
              token: where[key],
              expires: new Date(Date.now() + 3600000), // 1 hour from now
              createdAt: new Date(),
            };
          }
        }
        
        return null;
      }),
    },
  },
  select: jest.fn().mockImplementation(function() {
    return {
      from: jest.fn().mockImplementation(function(table) {
        return {
          where: jest.fn().mockImplementation(function(condition) {
            return {
              orderBy: jest.fn().mockImplementation(function(order) {
                return {
                  limit: jest.fn().mockImplementation(function(limit) {
                    return {
                      offset: jest.fn().mockImplementation(function(offset) {
                        // Return published articles
                        return mockArticles.filter(a => a.published);
                      }),
                    };
                  }),
                };
              }),
              innerJoin: jest.fn().mockImplementation(function(joinTable, joinCondition) {
                return {
                  innerJoin: jest.fn().mockImplementation(function(secondJoinTable, secondJoinCondition) {
                    return {
                      where: jest.fn().mockImplementation(function(whereCondition) {
                        // Return filtered articles based on tag
                        return mockArticles.filter(a => a.published);
                      }),
                    };
                  }),
                  where: jest.fn().mockImplementation(function(whereCondition) {
                    // Return articles with tags
                    return mockArticles.map(article => ({
                      ...article,
                      tagName: 'JavaScript', // Mock tag name
                    }));
                  }),
                };
              }),
            };
          }),
          innerJoin: jest.fn().mockImplementation(function(joinTable, joinCondition) {
            return {
              innerJoin: jest.fn().mockImplementation(function(secondJoinTable, secondJoinCondition) {
                return {
                  where: jest.fn().mockImplementation(function(whereCondition) {
                    // Return articles with tags
                    return mockArticles.map(article => ({
                      articleId: article.id,
                      tagName: 'JavaScript', // Mock tag name
                    }));
                  }),
                };
              }),
              where: jest.fn().mockImplementation(function(whereCondition) {
                // Return articles with tags
                return mockArticles.map(article => ({
                  articleId: article.id,
                  tagName: 'JavaScript', // Mock tag name
                }));
              }),
            };
          }),
          orderBy: jest.fn().mockImplementation(function(order) {
            return mockArticles.filter(a => a.published);
          }),
        };
      }),
    };
  }),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  insert: jest.fn().mockImplementation(function(table) {
    return {
      values: jest.fn().mockImplementation(function(values) {
        return {
          returning: jest.fn().mockImplementation(function() {
            if (table.name === 'users') {
              return [{ id: mockUsers.admin.id + 1, ...values }];
            }
            if (table.name === 'articles') {
              return [{ id: mockArticles[0].id + 1, ...values }];
            }
            if (table.name === 'claps') {
              return [{ id: 1, ...values }];
            }
            if (table.name === 'annotations') {
              return [{ id: 1, ...values }];
            }
            return [{ id: 1, ...values }];
          }),
        };
      }),
    };
  }),
  update: jest.fn().mockImplementation(function(table) {
    return {
      set: jest.fn().mockImplementation(function(values) {
        return {
          where: jest.fn().mockImplementation(function(condition) {
            return {
              returning: jest.fn().mockImplementation(function() {
                if (table.name === 'users') {
                  return [{ ...mockUsers.admin, ...values }];
                }
                if (table.name === 'articles') {
                  return [{ ...mockArticles[0], ...values }];
                }
                if (table.name === 'claps') {
                  return [{ id: 1, articleId: 1, textFragment: 'Test', position: { startOffset: 0, endOffset: 10 }, count: 2, ...values }];
                }
                if (table.name === 'annotations') {
                  return [{ id: 1, articleId: 1, userId: 'user1', textFragment: 'Test', position: { startOffset: 0, endOffset: 10 }, note: 'Updated note', ...values }];
                }
                return [{ id: 1, ...values }];
              }),
            };
          }),
        };
      }),
    };
  }),
  delete: jest.fn().mockImplementation(function(table) {
    return {
      where: jest.fn().mockImplementation(function(condition) {
        return {
          returning: jest.fn().mockImplementation(function() {
            if (table.name === 'users') {
              return [mockUsers.admin];
            }
            if (table.name === 'articles') {
              return [mockArticles[0]];
            }
            if (table.name === 'annotations') {
              return [{ id: 1, articleId: 1, userId: 'user1', textFragment: 'Test', position: { startOffset: 0, endOffset: 10 }, note: 'Test note' }];
            }
            return [{ id: 1 }];
          }),
        };
      }),
    };
  }),
  transaction: jest.fn().mockImplementation(async (callback) => {
    return await callback({
      query: {
        users: {
          findFirst: jest.fn(({ where }) => {
            if (!where) return null;
            
            for (const key in where) {
              if (key === 'email' && where[key] === mockUsers.admin.email) {
                return mockUsers.admin;
              }
              if (key === 'id' && where[key] === mockUsers.admin.id) {
                return mockUsers.admin;
              }
            }
            
            return null;
          }),
        },
        articles: {
          findFirst: jest.fn(({ where }) => {
            if (!where) return null;
            
            for (const key in where) {
              if (key === 'slug') {
                return mockArticles.find(a => a.slug === where[key]);
              }
              if (key === 'id') {
                return mockArticles.find(a => a.id === where[key]);
              }
            }
            
            return null;
          }),
        },
        categories: {
          findFirst: jest.fn(({ where }) => {
            if (!where) return null;
            
            for (const key in where) {
              if (key === 'slug') {
                return mockCategories.find(c => c.slug === where[key]);
              }
              if (key === 'id') {
                return mockCategories.find(c => c.id === where[key]);
              }
            }
            
            return null;
          }),
        },
        tags: {
          findFirst: jest.fn(({ where }) => {
            if (!where) return null;
            
            for (const key in where) {
              if (key === 'name') {
                return mockTags.find(t => t.name === where[key]);
              }
              if (key === 'id') {
                return mockTags.find(t => t.id === where[key]);
              }
            }
            
            return null;
          }),
        },
      },
      select: jest.fn().mockImplementation(function() {
        return {
          from: jest.fn().mockImplementation(function(table) {
            return {
              innerJoin: jest.fn().mockImplementation(function(joinTable, joinCondition) {
                return {
                  where: jest.fn().mockImplementation(function(condition) {
                    return [{ name: 'JavaScript' }];
                  }),
                };
              }),
            };
          }),
        };
      }),
      insert: jest.fn().mockImplementation(function(table) {
        return {
          values: jest.fn().mockImplementation(function(values) {
            return {
              returning: jest.fn().mockImplementation(function() {
                return [{ id: 1, ...values }];
              }),
            };
          }),
        };
      }),
      update: jest.fn().mockImplementation(function(table) {
        return {
          set: jest.fn().mockImplementation(function(values) {
            return {
              where: jest.fn().mockImplementation(function(condition) {
                return {
                  returning: jest.fn().mockImplementation(function() {
                    return [{ id: 1, ...values }];
                  }),
                };
              }),
            };
          }),
        };
      }),
      delete: jest.fn().mockImplementation(function(table) {
        return {
          where: jest.fn().mockImplementation(function(condition) {
            return {
              returning: jest.fn().mockImplementation(function() {
                return [{ id: 1 }];
              }),
            };
          }),
        };
      }),
    });
  }),
  innerJoin: jest.fn().mockReturnThis(),
};

// Mock the database module
jest.mock('../../db', () => {
  return { db: mockDb };
});
