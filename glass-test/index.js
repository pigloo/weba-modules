import * as THREE from 'three';
import metaversefile from 'metaversefile';

// for hdr textures use this RGBELoader
import {RGBELoader} from 'three/examples//jsm/loaders/RGBELoader.js';
const {useApp, useLoaders, useScene, useRenderer} = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

export default e => {
  const app = useApp();
  const scene = useScene();
  const renderer = useRenderer();

  // add an environment map for the glass to reflect, there are a few types such as this hdr map
  // might be better to use a three.js cube camera to take a snapshot of your scene and use that instead
  const envMap = new RGBELoader()
    .load(`${baseUrl}adams_place_bridge_1k.hdr`, function(texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
    });

  e.waitUntil((async () => {
    // load the gltf model
    const url = `${baseUrl}object.glb`;
    let mesh = await new Promise((resolve, reject) => {
      const {gltfLoader} = useLoaders();
      gltfLoader.load(url, resolve, function onprogress() {}, reject);
    });

    mesh = mesh.scene; // remove a useless wrapper

    // look through the items in the object and find the glass object
    mesh.traverse(o => {
      if (o.isMesh) {
        if (o.name === 'glass') {
          // replace the object material with a glass like material
          const glass = new THREE.MeshPhysicalMaterial({
            thickness: 5.0,
            roughness: 0,
            clearcoat: 1,
            clearcoatRoughness: 0,
            transmission: 1,
            ior: 1.25,
            envMap: envMap,
            envMapIntensity: 25,
            color: 0xffffff,
            attenuationColor: 0xffe79e,
            attenuationDistance: 0,
          });
          o.material = glass;
        }
      }
    });

    app.add(mesh);
  })());

  app.updateMatrixWorld();

  return app;
};
