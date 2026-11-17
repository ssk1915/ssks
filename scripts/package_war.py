#!/usr/bin/env python3
import os
import shutil
import zipfile

def package_war():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    backend_dir = os.path.join(base_dir, "backend")
    webapp_dir = os.path.join(backend_dir, "src", "main", "webapp")
    classes_dir = os.path.join(backend_dir, "target", "classes")
    target_dir = os.path.join(backend_dir, "target")
    output_war_dir = os.path.join(target_dir, "travelmates")
    output_war_file = os.path.join(target_dir, "travelmates.war")

    print(f">> 1. Preparing exploded WAR directory: {output_war_dir}")
    if os.path.exists(output_war_dir):
        shutil.rmtree(output_war_dir)
    os.makedirs(output_war_dir, exist_ok=True)

    # 1. Copy webapp (index.html, css, js, WEB-INF/web.xml, etc.)
    shutil.copytree(webapp_dir, output_war_dir, dirs_exist_ok=True)

    # 2. Copy compiled classes & XMLs to WEB-INF/classes
    target_classes_dest = os.path.join(output_war_dir, "WEB-INF", "classes")
    os.makedirs(target_classes_dest, exist_ok=True)
    shutil.copytree(classes_dir, target_classes_dest, dirs_exist_ok=True)

    # 3. Package into travelmates.war (standard zip format)
    print(f">> 2. Packaging WAR archive: {output_war_file}")
    with zipfile.ZipFile(output_war_file, 'w', zipfile.ZIP_DEFLATED) as war_zip:
        for root, dirs, files in os.walk(output_war_dir):
            for file in files:
                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, output_war_dir)
                war_zip.write(abs_path, rel_path)

    print(f"✅ WAR build completed: {output_war_file}")
    print(f"✅ Exploded WAR directory: {output_war_dir}")

if __name__ == "__main__":
    package_war()

