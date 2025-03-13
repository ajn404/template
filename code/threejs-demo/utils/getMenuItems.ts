import fs from 'fs';
import path from 'path';

interface MenuItem {
    name: string;
    href: string;
    children?: MenuItem[];
}

function isDirectory(filePath: string): boolean {
    return fs.statSync(filePath).isDirectory();
}

function isValidPageFile(file: string): boolean {
    return (
        file === 'page.tsx' ||
        file === 'route.tsx' ||
        file.endsWith('.tsx') &&
        !file.startsWith('_') &&
        !['_app.tsx', '_document.tsx', 'loading.tsx', 'layout.tsx', 'error.tsx'].includes(file)
    );
}

function buildMenuItems(dir: string, parentPath = ''): MenuItem[] {
    return fs.readdirSync(dir).reduce((acc, item) => {
        const itemPath = path.join(dir, item);
        const isDir = isDirectory(itemPath);

        if (isDir && !item.startsWith('_')) {
            // 处理子目录
            const children = buildMenuItems(itemPath, path.join(parentPath, item));
            if (children.length > 0) {
                acc.push({
                    name: item.replace(/([a-z])([A-Z])/g, '$1 $2'), // 转换驼峰命名
                    href: path.join(parentPath, item),
                    children
                });
            }
        } else if (isValidPageFile(item)) {
            // 处理页面文件
            const fileName = item.replace(/\.tsx$/, '');
            const routePath = parentPath || '/';

            acc.push({
                name: routePath==='/'?'home': fileName.replace(/([a-z])([A-Z])/g, '$1 $2'), // 转换驼峰命名
                href: routePath
            });
        }

        return acc;
    }, [] as MenuItem[]);
}

export function getMenuItems(): MenuItem[] {
    const appDir = path.join(process.cwd(), 'app');
    return buildMenuItems(appDir);
}