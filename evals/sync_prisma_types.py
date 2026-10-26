import os
import shutil
import subprocess
import sys
from pathlib import Path

# Force utf-8
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

ROOT = Path(__file__).resolve().parent.parent
SCHEMA_FILE = ROOT / "prisma" / "schema.prisma"
TEMP_SCHEMA = ROOT / "prisma" / "schema_temp.prisma"
TEMP_OUT = ROOT / "node_modules" / ".prisma_temp"

def main():
    content = SCHEMA_FILE.read_text(encoding="utf-8")
    # Replace client block with custom output
    old_gen = 'generator client {\n  provider = "prisma-client-js"\n}'
    new_gen = 'generator client {\n  provider = "prisma-client-js"\n  output   = "../node_modules/.prisma_temp"\n}'
    
    if old_gen not in content:
        # try CRLF
        old_gen = 'generator client {\r\n  provider = "prisma-client-js"\r\n}'
        new_gen = 'generator client {\r\n  provider = "prisma-client-js"\r\n  output   = "../node_modules/.prisma_temp"\r\n}'

    if old_gen not in content:
        print("Could not find generator block, aborting")
        return

    temp_content = content.replace(old_gen, new_gen)
    TEMP_SCHEMA.write_text(temp_content, encoding="utf-8")
    
    try:
        print("Running prisma generate on temporary schema...")
        res = subprocess.run(
            ["pnpm", "exec", "prisma", "generate", "--schema=prisma/schema_temp.prisma"],
            cwd=str(ROOT),
            shell=True,
            capture_output=True,
            text=True,
            encoding="utf-8"
        )
        print("STDOUT:", res.stdout)
        print("STDERR:", res.stderr)
        if res.returncode != 0:
            print(f"Prisma generate failed with code {res.returncode}")
            return
            
        # Target destinations
        destinations = [
            ROOT / "node_modules" / ".prisma" / "client",
            ROOT / "node_modules" / ".pnpm" / "@prisma+client@6.2.1_prisma@6.2.1" / "node_modules" / ".prisma" / "client"
        ]
        
        for dest in destinations:
            if dest.exists():
                for filename in ["index.d.ts", "index.js", "default.d.ts", "default.js", "schema.prisma"]:
                    src_file = TEMP_OUT / filename
                    dest_file = dest / filename
                    if src_file.exists():
                        print(f"Copying {filename} to {dest}")
                        shutil.copy2(src_file, dest_file)
                        
        print("Synchronization completed successfully!")
    finally:
        if TEMP_SCHEMA.exists():
            TEMP_SCHEMA.unlink()
        if TEMP_OUT.exists():
            shutil.rmtree(TEMP_OUT, ignore_errors=True)

if __name__ == "__main__":
    main()
