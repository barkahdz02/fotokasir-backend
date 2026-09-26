import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction } from './entities/transaction.entity';
import { TransactionItem } from './entities/transaction-item.entity';
import { Product } from '../products/entities/product.entity';
import { CashSession } from '../cash-sessions/entities/cash-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, TransactionItem, Product, CashSession])],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}