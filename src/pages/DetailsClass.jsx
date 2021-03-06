import React, { useEffect } from "react";
import Youtube from "react-youtube";
import { useDispatch, useSelector } from "react-redux";
import {
  statusCourses,
  watchCourse,
  messageCourse,
} from "../store/actions/courses";
import SidebarClass from "../components/SidebarClass";
import PageHeader from "../components/PageHeader";
import Loading from "../components/Loading";
import Centered from "../components/Centered";
import CourseAPI from "../api/course";

export default function DetailsClass({ match, history }) {
  const dispatch = useDispatch();
  const COURSES = useSelector((state) => state.courses);

  useEffect(() => {
    window.scroll(0, 0);

    dispatch(statusCourses("loading"));
    CourseAPI.details(match.params.class)
      .then((res) => {
        if (res.chapters.length === 0)
          throw new Error("Class might be not ready yet");
        else dispatch(watchCourse(res));
      })
      .catch((err) => {
        dispatch(messageCourse(err?.response?.data?.message ?? "error"));
      });
  }, [match.params.class, dispatch]);

  if (COURSES?.status === "loading") return <Loading></Loading>;
  if (COURSES?.status === "error")
    return <Centered>{COURSES?.message ?? "Error here"}</Centered>;

  let currentChapter, currentLesson;

  if (
    COURSES?.status === "ok" &&
    COURSES?.data?.[match.params.class]?.chapters
  ) {
    currentChapter =
      COURSES?.data?.[match.params.class]?.chapters?.find(
        (chapter) => +chapter.id === +match.params.chapter
      ) ?? COURSES?.data[match.params.class]?.chapters[0];

    currentLesson =
      currentChapter?.lessons?.find(
        (lesson) => lesson.video === match.params.uid
      ) ?? currentChapter?.lessons?.[0];
  }

  return (
    <div className="flex">
      {COURSES?.data?.[match.params.class]?.chapters?.length > 0 && (
        <>
          <SidebarClass
            data={COURSES?.data[match.params.class]}
            defaultUri={`/courses/${match.params.class}/${currentChapter.id}/${currentLesson.video}`}
          />
          <main className="flex-1">
            <div className="px-4 sm:px-16">
              <PageHeader
                title={currentLesson?.name ?? "Lesson Name"}
                subtitle={`Part of Chapters: ${
                  currentChapter?.name ?? "Chapter Name"
                }`}
              />
              <section className="flex flex-col mt-4">
                <div className="flex justify-start items-center -mx-4">
                  <div className="w-full px-8">
                    <div className="relative">
                      <div className="video-wrapper">
                        {currentLesson?.video && (
                          <Youtube
                            videoId={currentLesson?.video}
                            id={currentLesson?.video}
                            opts={{
                              playerVars: {
                                autoplay: 1,
                                controls: 1,
                                showinfo: 0,
                                rel: 0,
                              },
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </main>
        </>
      )}
    </div>
  );
}
