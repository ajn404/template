# Vue 3 + TypeScript 类开发实践

这个项目展示了如何在Vue 3中使用TypeScript类来组织业务逻辑，结合了面向对象编程的优势和Vue 3的响应式系统。

## 项目结构

- `src/models/Todo.ts` - Todo模型类
- `src/services/TodoService.ts` - 处理Todo业务逻辑的服务类
- `src/stores/TodoStore.ts` - 管理Todo状态的Store类
- `src/composables/useTodoStore.ts` - 提供TodoStore的组合式函数
- `src/components/TodoList.vue` - 展示和管理待办事项的组件
- `src/App.vue` - 应用入口组件

## 类开发的优势

1. **代码组织** - 使用类可以更好地组织相关的数据和方法
2. **封装** - 隐藏实现细节，只暴露必要的接口
3. **继承和多态** - 可以利用面向对象的继承和多态特性
4. **类型安全** - 结合TypeScript提供更好的类型检查
5. **可测试性** - 业务逻辑与UI分离，更容易进行单元测试

## 运行项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 实现细节

### 模型层 (Model)

使用类定义数据模型，包含数据属性和操作数据的方法。

### 服务层 (Service)

处理业务逻辑，与外部API交互，管理数据状态。

### 存储层 (Store)

管理应用状态，提供计算属性和操作方法。

### 视图层 (View)

使用Vue组件展示数据并处理用户交互。

## 最佳实践

1. 将业务逻辑与UI分离
2. 使用依赖注入管理服务实例
3. 利用Vue的响应式系统与类结合
4. 使用组合式API提供更好的类型推断
5. 保持类的单一职责原则

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
pnpm test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
pnpm build

# Runs the end-to-end tests
pnpm test:e2e
# Runs the tests only on Chromium
pnpm test:e2e --project=chromium
# Runs the tests of a specific file
pnpm test:e2e tests/example.spec.ts
# Runs the tests in debug mode
pnpm test:e2e --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```
