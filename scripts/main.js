// global variables
let renderer;
let cssRenderer;

let scene;
let camera;
let control;

let initialScreenWidth;
let initialScreenHeight;

let screen;

function init() {

    initialScreenWidth = window.innerWidth;
    initialScreenHeight = window.innerHeight;

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera();

    let zoom = 192;
    let defaultCameraPos = THREE.Vector3(-1, 0.5, 0.75);

    camera.left = window.innerWidth / -zoom;
    camera.right = window.innerWidth / zoom;
    camera.top = window.innerHeight / zoom;
    camera.bottom = window.innerHeight / -zoom;

    camera.near = -300;
    camera.far = 1500;

    camera.updateProjectionMatrix();

    // create a render, sets the background color and the size
    renderer = new THREE.WebGLRenderer({alpha: true});
    // renderer.setClearColor(0x000000, 1);
    
    // get container to contain three.js canvas.
    let container = document.getElementById('canvas-container');
    let w = container.offsetWidth;
    let h = container.offsetHeight;
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);
    
    // renderer.domElement.style.position = 'absolute';
    // renderer.domElement.style.top = 0;    
    renderer.domElement.style.zIndex = 0;

    // create CSS renderer
    // cssRenderer = new THREE.CSS3DRenderer();
    // cssRenderer.setSize(window.innerWidth, window.innerHeight);
    // cssRenderer.domElement.style.position = 'absolute';
    // cssRenderer.domElement.style.top = 0;
    // cssRenderer.domElement.style.zIndex = 1;

    // position and point the camera to the center of the scene
    camera.position.set(-1, 4, 1);
    
    let focalPoint = scene.position.clone();
    
    focalPoint.y += 3;
    camera.lookAt(focalPoint);

    let dirLight = new THREE.DirectionalLight();
    scene.add(dirLight);
    // dirLight.position.set(-500, 200, 300);
    dirLight.position.set(-20,100,50);

    // add the output of the renderer to the html element
    // document.body.appendChild(cssRenderer.domElement);
    // document.body.appendChild(renderer.domElement);

    let planet = [];
    for (let i = 0; i < 9; i++) {
        let ground = new Floor(
            new THREE.Vector3(0,-i,0),
            new THREE.Vector2(9,9),
            new THREE.Vector3(),
            0.9,
            0,
            colors=[0xacff78,0x292929], // light green, blue
            colorProb=[0,1],
            holes=[[-3,-3],[3,-3],[3,3]]
        );
        planet.push(ground);
        ground.addToScene(scene);
    }

    // add player
    let player = new Player(0,0);
    scene.add(player);

    // add screen 0
    let quaternion = new THREE.Quaternion();
    // quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), -Math.PI/2);
    // let screen = new Screen(
    //     new THREE.Vector3(4.5,3.8,0),
    //     new THREE.Vector2(9,4.5),
    //     quaternion
    // );
    // screen.addToScene(scene);

    // main animation loop
    let frame = 0;
    let playerAnimations = [];
    let playerIsFalling = false;

    const animate = () => {
        // camera.position.set(-1,.5,.75);
        // cssRenderer.render(scene, camera);
        // camera.position.multiplyScalar(1000);
        renderer.render(scene, camera);

        player.animate(planet[0]);

        frame += 1;
        requestAnimationFrame(animate);
        
        // TODO: Consider applying quaternion to camera instead
        if (player.isFalling && camera.position.y > -10) {
            let vel = .3;
            focalPoint.y -= vel;
            camera.lookAt(focalPoint);
            camera.position.setY(camera.position.y - vel);
        } else if (player.isFalling) {
            scrollTransition();
            player.isFalling = false;
            player.isDead = true;
        }

        if(frame == 2) {
            window.scrollTo(0,0);
        }

        if(frame % 200 == 0) {
            // console.log(planet[0].getPositions());
            // console.log(player.position);
            // console.log(player.isFalling);
        }
    }

    animate();

    $(window).scroll(() => {
        let scroll = $(window).scrollTop();
        let transparency = Math.min(Math.max(scroll/window.innerHeight, 0.5), 1);
        let redness = Math.min(Math.max(scroll/window.innerHeight*255, 64), 215);
        // console.log(scroll);
        console.log(transparency);
        console.log(redness);
        // $('#nav-bar').css('background-color', `rgba(${redness}, 64, 64, ${transparency})`);
        $('#nav-bar').css('background-color', `rgba(64, 64, 64, ${transparency})`);    

    });

    $('#title').click(() => {
        location.reload();
    });
}

window.onload = init;

window.addEventListener('resize', onWindowResize, false);

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    // cssRenderer.setSize(window.innerWidth, window.innerHeight);

    console.log(screen.scale);
    screen.scale.setX(window.innerWidth/initialScreenWidth);
    screen.scale.setY(window.innerHeight/initialScreenHeight);

    screen.reflow();
}

function scrollTransition() {
    $('body').css('overflow', 'auto');

    window.scrollBy({
        top: window.innerHeight,
        left: 0,
        behavior: 'smooth'
    });
}