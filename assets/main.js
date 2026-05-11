
const menuBtn=document.querySelector('.menu-btn');
const mobile=document.querySelector('.mobile-links');
if(menuBtn&&mobile){menuBtn.addEventListener('click',()=>mobile.classList.toggle('open'))}
const form=document.querySelector('[data-contact-form]');
if(form){form.addEventListener('submit',e=>{
  e.preventDefault();
  const data=new FormData(form);
  const subject=encodeURIComponent(data.get('subject')||'Data Sales Science inquiry');
  const body=encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`);
  window.location.href=`mailto:mark@datasalesscience.com?subject=${subject}&body=${body}`;
})}
