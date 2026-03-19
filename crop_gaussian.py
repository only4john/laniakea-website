#!/usr/bin/env python3
"""
crop_gaussian.py - 裁剪 Gaussian Splatting PLY 模型

用法:
    python3 crop_gaussian.py                        # 交互式选择包围盒
    python3 crop_gaussian.py --view-stats            # 只看模型空间范围，不裁剪
    python3 crop_gaussian.py --xmin 0 --xmax 1 --ymin 0 --ymax 1 --zmin 0 --zmax 1
"""

import numpy as np
import argparse
import sys

INPUT_FILE = "/root/.openclaw/workspace/laniakea-website/rock_art.ply"
OUTPUT_FILE = "/root/.openclaw/workspace/laniakea-website/rock_art_cropped.ply"


def load_ply(path):
    """加载 PLY 文件，返回 positions 和所有属性"""
    with open(path, 'rb') as f:
        header_lines = []
        while True:
            line = f.readline().decode('ascii', errors='ignore').strip()
            header_lines.append(line)
            if 'end_header' in line:
                break

        # 找 vertex 数量
        vertex_count = 0
        props = []
        for line in header_lines:
            if line.startswith('element vertex'):
                vertex_count = int(line.split()[2])
            elif line.startswith('property'):
                props.append(line)

        print(f"加载 {vertex_count} 个高斯点，{len(props)} 个属性...")

        # 读二进制数据
        data = np.frombuffer(f.read(), dtype=np.float32)
        data = data.reshape(-1, len(props))

        # 解析位置
        positions = data[:, 0:3]
        return data, positions, props, vertex_count


def get_prop_indices(props):
    """获取各属性在数据列中的索引"""
    names = [p.split()[-1] for p in props]
    return {n: names.index(n) for n in names if n in names}


def view_stats(positions):
    """打印模型空间范围"""
    print("\n=== 模型空间范围 ===")
    print(f"X: [{positions[:,0].min():.4f}, {positions[:,0].max():.4f}]")
    print(f"Y: [{positions[:,1].min():.4f}, {positions[:,1].max():.4f}]")
    print(f"Z: [{positions[:,2].min():.4f}, {positions[:,2].max():.4f}]")


def crop_ply(data, positions, props, vertex_count, bbox):
    """按包围盒裁剪高斯点"""
    x, y, z = positions[:, 0], positions[:, 1], positions[:, 2]
    mask = (
        (x >= bbox[0]) & (x <= bbox[1]) &
        (y >= bbox[2]) & (y <= bbox[3]) &
        (z >= bbox[4]) & (z <= bbox[5])
    )
    cropped = data[mask]
    return cropped, mask.sum()


def save_ply(data, props, output_path):
    """保存为 PLY 文件"""
    header = "ply\nformat binary_little_endian 1.0\n"
    header += f"element vertex {len(data)}\n"
    for p in props:
        header += p + "\n"
    header += "end_header\n"

    with open(output_path, 'wb') as f:
        f.write(header.encode('ascii'))
        f.write(data.astype(np.float32).tobytes())
    print(f"✅ 已保存到: {output_path}")


def main():
    parser = argparse.ArgumentParser(description='裁剪 Gaussian Splatting PLY 模型')
    parser.add_argument('--view-stats', action='store_true', help='只查看模型范围')
    parser.add_argument('--xmin', type=float)
    parser.add_argument('--xmax', type=float)
    parser.add_argument('--ymin', type=float)
    parser.add_argument('--ymax', type=float)
    parser.add_argument('--zmin', type=float)
    parser.add_argument('--zmax', type=float)
    parser.add_argument('--input', type=str, default=INPUT_FILE)
    parser.add_argument('--output', type=str, default=OUTPUT_FILE)
    args = parser.parse_args()

    data, positions, props, vertex_count = load_ply(args.input)
    view_stats(positions)

    if args.view_stats:
        return

    # 用命令行参数或交互
    if all([args.xmin is not None, args.xmax is not None,
            args.ymin is not None, args.ymax is not None,
            args.zmin is not None, args.zmax is not None]):
        bbox = [args.xmin, args.xmax, args.ymin, args.ymax, args.zmin, args.zmax]
    else:
        print("\n请输入裁剪区域范围:")
        try:
            xmin = float(input("X 最小值: "))
            xmax = float(input("X 最大值: "))
            ymin = float(input("Y 最小值: "))
            ymax = float(input("Y 最大值: "))
            zmin = float(input("Z 最小值: "))
            zmax = float(input("Z 最大值: "))
            bbox = [xmin, xmax, ymin, ymax, zmin, zmax]
        except (ValueError, EOFError):
            print("未输入有效参数，退出。")
            sys.exit(0)

    cropped, kept = crop_ply(data, positions, props, vertex_count, bbox)
    print(f"\n原始点数: {vertex_count}，裁剪后点数: {kept}（保留 {kept/vertex_count*100:.1f}%）")
    save_ply(cropped, props, args.output)


if __name__ == '__main__':
    main()
