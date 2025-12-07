// simple page fade class management
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.remove('page--fade');
  setTimeout(()=> document.body.classList.add('page--visible'), 10);
});
