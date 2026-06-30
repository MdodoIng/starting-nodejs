import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MenuService } from './menu.service';
import { MenuItem } from './entities/menu-item.entity';
import { NotFoundException } from '@nestjs/common';

describe('MenuService', () => {
  let service: MenuService;
  const mockRepo = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MenuService,
        { provide: getRepositoryToken(MenuItem), useValue: mockRepo },
      ],
    }).compile();

    service = module.get(MenuService);
    jest.clearAllMocks();
  });

  it('returns all items', async () => {
    mockRepo.find.mockResolvedValue([{ id: '1', name: 'Taco', price: 5 }]);
    expect(await service.findAll()).toHaveLength(1);
  });

  it('throws NotFoundException when item missing', async () => {
    mockRepo.findOneBy.mockResolvedValue(null);
    await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
  });
});