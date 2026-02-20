import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { TodoSchema, TodoSchemaType } from '@repo/validation';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';

import { TodosService } from 'src/todos/todos.service';
import { ZodType } from 'zod';

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

  @Get('with-vehicles')
  async getAllTodosWithVehicles(@Session() userSession: UserSession) {
    return await this.todoservice.getUserTodosWithVehicles(userSession);
  }

  @Get(':todoId')
  async getTodoById(@Session() userSession: UserSession, @Param('todoId') todoId: string) {
    return await this.todoservice.getTodoById(userSession, todoId);
  }

  @Get('vehicle/:vehicleId')
  async getTodos(@Session() userSession: UserSession, @Param('vehicleId') vehicleId: string) {
    return await this.todoservice.getVehicleTodos(userSession, vehicleId);
  }
  @Patch(':todoId/toggle')
  async toggleTodo(
    @Session() userSession: UserSession,
    @Param('todoId') todoId: string,
    @Body() body: { complete: boolean },
  ) {
    return await this.todoservice.toggleTodoCompletion(userSession, todoId, body.complete);
  }
  @Delete(':todoId')
  async deleteTodo(@Session() userSession: UserSession, @Param('todoId') todoId: string) {
    await this.todoservice.deleteTodo(userSession, todoId);
    return { status: 'success' };
  }

  @Put(':todoId')
  async updateTodo(
    @Session() userSession: UserSession,
    @Param('todoId') todoId: string,
    @Body(new ZodValidationPipe(TodoSchema as ZodType)) todoDto: TodoSchemaType,
  ) {
    return await this.todoservice.updateTodo(userSession, todoId, todoDto);
  }
}
