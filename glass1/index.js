import * as THREE from 'three';
import metaversefile from 'metaversefile';
const {useApp, useLoaders} = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

export default e => {
  const app = useApp();

  // use a cubemap to have something to reflect
  const envMap = (() => {
    const nx = `${baseUrl}cubemap/negx.jpg`;
    const px = `${baseUrl}cubemap/posx.jpg`;
    const py = `${baseUrl}cubemap/posy.jpg`;
    const ny = `${baseUrl}cubemap/negy.jpg`;
    const pz = `${baseUrl}cubemap/posz.jpg`;
    const nz = `${baseUrl}cubemap/negz.jpg`;

    const texture = new THREE.CubeTextureLoader().load([px, nx, py, ny, pz, nz]);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.encoding = THREE.sRGBEncoding;
    texture.needsUpdate = true;

    return texture;
  })();

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
