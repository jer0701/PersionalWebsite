const gulp = require('gulp')
const sass = require('gulp-sass')
const autoprefix = require('gulp-autoprefixer')
const clearCss = require('gulp-clean-css')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const browserSync = require('browser-sync')
const imagemin = require('gulp-imagemin')

gulp.task('sass', function () {
  gulp.src('./source/css/*.scss')
      .pipe(autoprefix())
      .pipe(sass())
      .pipe(clearCss())
      .pipe(gulp.dest('./dist/css'))
      .pipe(browserSync.reload({stream:true}));
});

gulp.task('minifyjs', function () {
  gulp.src('./source/js/**/*.js')
      .pipe(rename({suffix: '.min'}))  //rename压缩后的文件名
      .pipe(uglify())   //压缩
      .pipe(gulp.dest('./dist/js'));
});

gulp.task('imagemin', function(){
    gulp.src('./source/images/*.{png,jpg,gif,ico}')
        .pipe(imagemin())
        .pipe(gulp.dest('./dist/images'));
});

gulp.task('watch', function() {
  gulp.watch('./source/css/*.scss', ['sass']);
  gulp.watch('./source/js/**/*.js', ['minifyjs']);
});

gulp.task('default', [
  'sass',
  'minifyjs',
  'imagemin',
  'watch'
]);
