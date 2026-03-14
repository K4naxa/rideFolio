import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { TodoSchema, TodoSchemaType } from '@repo/validation';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';

import { TodosService } from 'src/todos/todos.service';
import z, { ZodType } from 'zod';

@Controller('todos')
export class TodosController {
  constructor(private todoservice: TodosService) {}

  @Post()
  async createTodo(
    @Session() userSession: UserSession,
    @Body(new ZodValidationPipe(TodoSchema as ZodType)) todoDto: TodoSchemaType,
  ) {
    return await this.todoservice.createTodo(userSession, todoDto);
  }

  @Get()
  async getAllTodosWithVehicles(@Session() userSession: UserSession) {
    return await this.todoservice.getAllTodos(userSession);
  }

  @Get(':todoId')
  async getTodoById(
    @Session() userSession: UserSession,
    @Param('todoId', new ZodValidationPipe(z.cuid())) todoId: string,
  ) {
    return await this.todoservice.getTodoById(userSession, todoId);
  }

  @Get('vehicle/:vehicleId')
  async getTodos(
    @Session() userSession: UserSession,
    @Param('vehicleId', new ZodValidationPipe(z.cuid())) vehicleId: string,
  ) {
    return await this.todoservice.getVehicleTodos(userSession, vehicleId);
  }
  @Patch(':todoId/toggle')
  async toggleTodo(
    @Session() userSession: UserSession,
    @Param('todoId', new ZodValidationPipe(z.cuid())) todoId: string,
    @Body('complete', new ZodValidationPipe(z.boolean())) complete: boolean,
  ) {
    return await this.todoservice.toggleTodoCompletion(userSession, todoId, complete);
  }
  @Delete(':todoId')
  async deleteTodo(
    @Session() userSession: UserSession,
    @Param('todoId', new ZodValidationPipe(z.cuid())) todoId: string,
  ) {
    await this.todoservice.deleteTodo(userSession, todoId);
    return { status: 'success' };
  }

  @Put(':todoId')
  async updateTodo(
    @Session() userSession: UserSession,
    @Param('todoId', new ZodValidationPipe(z.cuid())) todoId: string,
    @Body(new ZodValidationPipe(TodoSchema as ZodType)) todoDto: TodoSchemaType,
  ) {
    return await this.todoservice.updateTodo(userSession, todoId, todoDto);
  }
}
