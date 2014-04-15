;(function($,win,doc){
    "use strict";
    $.cieldonfileupload=function(el, options){
        var self=this,
            o,
            t;
        self.el=el;
        self.$el=$(el);
        self.$el.data("CieldonFileuoload",self);
        self.input=self.$el.find("input[type=file]");
        self.init=function(){
            self.options = o = $.extend({}, $.cieldonfileupload.defaults, options);
            self.width=self.$el.attr("data-width") || o.width;
            self.height=self.$el.attr("data-height") || o.height;
            self.type=self.$el.attr("data-type") || o.type;
            self.target=self.$el.attr("data-div")
            switch (self.type){
                case "0":
                    self.$el.html('<div class="file-img" style="width: '+self.width+'px; height: '+self.height+'px;"><div class="file-btn"><a style="width: '+self.width+'px; height: '+self.height+'px;"><p><i class="fa fa-plus"></i><small>上传图片</small></p></a><input type="file" value="上传图片" data-token="'+ o.token+'" data-bucket="'+o.bucket+'" accept＝"image/jpg, image/jpeg, image/png"></div></div>');
                    break;
                case "1":
                    self.$el.html('<div class="file-btn"><a class="btn btn-info">上传图片</a><input type="file" value="上传图片" data-div="'+self.target+'" data-token="'+ o.token+'" data-bucket="'+o.bucket+'" data-width="'+self.width+'" data-height="'+self.height+'" accept＝"image/jpg, image/jpeg, image/png"/></div>');
                    break;
                case "2":
                    self.$el.html('<div class="file-img" style="width: '+self.width+'px; height: '+self.height+'px;"><div class="file-btn"><a><p><i class="fa fa-plus"></i><small>上传图片</small></p></a><input type="file" value="上传图片" multiple data-token="'+ o.token+'" data-bucket="'+o.bucket+'" accept＝"image/jpg, image/jpeg, image/png"/></div></div>');
                    break;
                case "3":
                    self.$el.html('<div class="file-btn"><a class="btn btn-info">上传图片</a><input type="file" value="上传图片" multiple data-div="'+self.target+'" data-token="'+ o.token+'" data-bucket="'+o.bucket+'" data-width="'+self.width+'" data-height="'+self.height+'" accept＝"image/jpg, image/jpeg, image/png"/></div><div class="file-list"></div>');
                    break;
                default :
                    break;
            };
            self.$el.on("change",self.input,function(){
                var input=$(this).find("input[type=file]")[0];
                if (input.type === 'file' && input.files && input.files.length > 0) {
                    $.each(input.files, function (idx, fileInfo) {
                        if (/^image\//.test(fileInfo.type)) {
                            self.getImgUrl(input,input.files,self.type,fileInfo);
                        } else {
                            options.fileUploadError("unsupported-file-type", fileInfo.type);
                        }
                    });
                }
            });
            self.$el.on("click",".file-del",function(){
                $(this).parents(".file-img").remove();
            });
        };
        self.init();
        self.readFileIntoDataUrl=function(fileInfo){
            var loader = $.Deferred(),
                fReader = new FileReader();
            fReader.onload = function (e) {
                loader.resolve(e.target.result);
            };
            fReader.onerror = loader.reject;
            fReader.onprogress = loader.notify;
            fReader.readAsDataURL(fileInfo);
            return loader.promise();
        };
        self.getImgUrl=function(input,r,type,fileInfo){
            var token= o.token;
            var bucket= o.bucket;
            var Qiniu_UploadUrl = "http://up.qiniu.com";
            var Qiniu_upload = function(f, token) {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', Qiniu_UploadUrl, true);
                var formData, startDate;
                formData = new FormData();
                formData.append('token', token);
                formData.append('file', f);
                var taking;
//                    xhr.upload.addEventListener("progress", function(evt) {
//                        if (evt.lengthComputable) {
//                            var nowDate = new Date().getTime();
//                            taking = nowDate - startDate;
//                            var x = (evt.loaded) / 1024;
//                            var y = taking / 1000;
//                            var uploadSpeed = (x / y);
//                            var formatSpeed;
//                            if (uploadSpeed > 1024) {
//                                formatSpeed = (uploadSpeed / 1024).toFixed(2) + "Mb\/s";
//                            } else {
//                                formatSpeed = uploadSpeed.toFixed(2) + "Kb\/s";
//                            }
//                            var percentComplete = Math.round(evt.loaded * 100 / evt.total);
//                        }else{
//                            console.log("ff");
//                        }
//
//                    }, false);
                xhr.onreadystatechange = function(response) {
                    if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText != "") {
                        var blkRet = JSON.parse(xhr.responseText);
                        var imgUrl='http://'+bucket+'.qiniudn.com/'+blkRet.key;
                        self.renderImg(input,imgUrl,type);
                    } else if (xhr.status != 200 && xhr.responseText) {

                    }
                };
                startDate = new Date().getTime();
                xhr.send(formData);
            };
            if (r.length > 0 && token != "") {
                Qiniu_upload(r[0], token);
            } else {
                $.when(self.readFileIntoDataUrl(fileInfo)).done(function (dataUrl) {
                    self.renderImg(input,dataUrl,type);
                }).fail(function (e) {
                        console.log("出错了");
                    });
            }

        };
        self.renderImg=function(input,img,type){
            $(input).attr("data-img",img);
            switch (type){
                case "0":
                    var a=$(input).prev();
                    a.css({"background-image":"url("+img+")"});
                    a.find("p").html("");
                    break;
                case "1":
                    var w=$(input).attr("data-width") || "100%",
                        h=$(input).attr("data-height") || "100%";
                    console.log(w);
                    $(self.target).css({"background-image":"url("+img+")","background-size": "100% 100%","background-repeat": "no-repeat","width":w,height:h});
                    break;
                case "2":
                    var fileImg=$(input).parents(".file-img"),
                        w=fileImg.innerWidth(),
                        h=fileImg.innerHeight(),
                        html='<div class="file-img" style="width:'+w+'px; height: '+h+'px;"><div class="file-btn"><a style="background-image: url('+img+')"></a><input type="file" value="上传图片"></div><i class="fa fa-times file-del"></i></div>';
                    fileImg.after(html);
                    break;
                case "3":
                    var fileList=$(input).parents(".file-btn").next(".file-list"),
                        w=$(input).attr("data-width"),
                        h=$(input).attr("data-height"),
                        html='<div class="file-img" style="width:'+w+'px; height: '+h+'px;"><div class="file-btn"><a style="background-image: url('+img+')"></a><input type="file" value="上传图片"></div><i class="fa fa-times file-del"></i></div>';
                    fileList.prepend(html);
                    break;
                default :
                    break;
            }
        }
    };
    $.cieldonfileupload.defaults={
        width:"",
        height:"",
        type:"",
        token:"",
        bucket:""
    };
    $.fn.cieldonfileupload=function(options,callback){
        return this.each(function(){
            var cdfileupload = $(this).data('CieldonFileuoload');
            if ((typeof(options)).match('object|undefined')){
                if (!cdfileupload) {
                    (new $.cieldonfileupload(this, options));
                }
            }
        });
    };
})(jQuery, window, document);