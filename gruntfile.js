 module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        //uglify 설정
        uglify: {
            build: {
                src: 'dist/opennui.js', //uglify할 대상 설정
                dest: 'dist/opennui.min.js' //uglify 결과 파일 설정
            }
        },
        //concat 설정
        concat:{
            basic: {
                src: ['src/define.js', 'src/byteArray.js', 'src/socket.js', 'src/opennui.js'],
                dest: 'dist/opennui.js'
            }
        }
    });
 
    // Load the plugin that provides the "uglify", "concat" tasks.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
 
    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify']); //grunt 명령어로 실행할 작업
    grunt.registerTask('nonzip', ['concat']); //grunt 명령어로 실행할 작업
};
